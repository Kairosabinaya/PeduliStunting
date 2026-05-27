# ADR-0002 — Renderer peta: SVG choropleth hand-rolled, bukan MapLibre/Leaflet

- **Status:** Superseded by [ADR-0004](./0004-map-library-maplibre.md) (2026-05-27)
- **Tanggal:** 2026-05-25
- **Author:** Kairos Abinaya Susanto
- **Konteks:** Stage 2 (presentation lapis Map page).

## Konteks

Halaman `/map` adalah landing data publik utama Peduli Stunting. Yang ditampilkan
adalah choropleth statis kabupaten/kota Indonesia berwarna tiga kelas ordinal
(`Rendah`/`Sedang`/`Tinggi`) untuk tahun yang dipilih, dengan klik wilayah membuka
panel detail di sisi kanan.

Constraint yang mengikat:

1. **Anggaran JS per route < 200KB transferred** (project guidelines §7). MapLibre GL JS ~190KB
   gzipped, Leaflet ~45KB gzipped + plugin choropleth + style sheet. Keduanya makan
   sebagian besar anggaran untuk halaman yang sebenarnya tidak butuh interaksi peta
   penuh (pan/zoom/basemap).
2. **Target perangkat menengah-bawah** (Vivo Y17 class) di Slow 3G + Low-end CPU
   throttle. WebGL renderer (MapLibre) memuaskan di desktop tetapi memicu jank di
   GPU lemah, terutama saat first paint.
3. **Tidak ada basemap raster**. Peta hanya butuh poligon administrative
   kabupaten/kota berwarna; tidak ada OpenStreetMap, satellite, atau label kota.
   Membayar runtime peta hanya untuk paint choropleth adalah pemborosan.
4. **SEO + SSR**. Peta adalah konten landing — wajib server-rendered dan langsung
   indeks-able tanpa JS aktif. MapLibre/Leaflet butuh client mount, hanya bisa
   diisi setelah hydration.
5. **Distorsi proyeksi dapat diterima**. Indonesia berada di lintang ±11°. Pada
   pita lintang ini, proyeksi equirectangular menghasilkan distorsi areal
   ~2% di ujung utara/selatan archipelago — tidak terlihat oleh mata dan tidak
   dipakai untuk pengukuran kuantitatif (warna sudah men-encode kategori).
6. **Geometri sudah disederhanakan upstream**. Skrip `import-boundaries` menyimpan
   GeoJSON yang sudah di-simplify (~10x reduction); poligon dapat di-render
   langsung sebagai `<path d="...">` tanpa simplifikasi runtime.

## Keputusan

Render peta sebagai **SVG choropleth hand-rolled**, server-rendered, tanpa library
peta sama sekali.

Komposisi pattern:

```
src/components/features/map/
├── map-geo.ts          // projector equirectangular + buildPathFromGeometry
├── map-data.ts         // buildMapFeatures, countByCategory, mergeYearlyRows
├── map-paths.tsx       // SERVER: <svg> + <a><path/></a> per region
├── map-viewer.tsx      // CLIENT: event delegation untuk navigasi soft
├── map-legend.tsx      // SERVER: legenda tiga kelas + opsional count
├── year-slider.tsx     // CLIENT: <input type="range"> → URL search param
├── source-toggle.tsx   // CLIENT: radiogroup actual/predicted
└── region-detail-panel.tsx // SERVER: panel detail + tabel year-over-year
```

### Detail penting

1. **Projector deterministik**. `makeProjector(bbox, viewBox)` mengubah
   `[lon, lat]` menjadi `[x, y]` pada SVG viewBox `1000×380` lewat persamaan linier
   tunggal. Tidak ada dependency `d3-geo` (10KB+ untuk fitur yang tidak dipakai).

2. **Path string di-build di server**. `buildPathFromGeometry(geometry, project)`
   menghasilkan `d="M…L…Z"` dan dikirim sebagai HTML. Klien tidak menjalankan
   geometry processing.

3. **Selection lewat URL, bukan state lokal**. Klik wilayah me-navigate ke
   `?wilayah=<kodeBps>`; panel kanan adalah Server Component yang re-render
   dengan data wilayah. Konsekuensi: tombol Back browser mengembalikan selection
   sebelumnya, link wilayah bisa di-share.

4. **Event delegation di wrapper klien tipis**. `<MapViewer>` (client) hanya
   listen `click`/`keydown` pada div parent, mencari `closest("a[data-kode-bps]")`,
   lalu `router.replace(href, { scroll: false })` di dalam `startTransition`.
   Tidak ada per-region event listener. Modifier-click (meta/ctrl/shift) tetap
   pass-through ke native untuk "open in new tab".

5. **Aksesibilitas via `<a>` semantik**. Setiap region adalah anchor dengan
   `aria-label` deskriptif (`"Buka detail Kabupaten Bogor (3201)"`). Keyboard
   navigation (Tab / Enter / Space) bekerja tanpa kode tambahan karena tetap
   anchor HTML. `focus-visible:stroke-focus` memberi ring fokus 1.5px.

6. **Tanpa pan/zoom**. Indonesia muat penuh pada viewBox dengan padding. Bila
   nantinya butuh zoom ke pulau tertentu, ADR baru akan menetapkan apakah cukup
   menambahkan layer kontrol "Fokus ke Jawa/Sumatra/Kalimantan/..." (URL-driven,
   tetap SVG) atau migrasi ke MapLibre.

## Alternatif yang dipertimbangkan

### A. MapLibre GL JS (WebGL)

Pro: pan/zoom native, basemap raster siap, vector tiles, animasi mulus.

Kontra:
- ~190KB gzipped → melahap > 95% anggaran 200KB untuk satu halaman.
- WebGL pada GPU integrated Android low-end memicu warmup ~600ms — melanggar
  LCP < 2.5s di Slow 3G.
- Butuh client mount; halaman tidak server-rendered dengan benar tanpa JS.
- Fitur yang dipakai hanya choropleth statis (≪ 5% kapabilitas library).

Ditolak: rasio biaya-manfaat sangat buruk untuk MVP.

### B. Leaflet + leaflet.choropleth

Pro: ringan dibanding MapLibre (~45KB + plugin), API matang.

Kontra:
- Tetap memerlukan client mount; tidak SSR-friendly.
- DOM-based di klien menambah ~200 child node yang dibuat client-side; first
  interaction tertunda hingga hydration + plugin init.
- Plugin choropleth tidak mendukung URL-driven selection out of the box.

Ditolak: SSR-loss tidak terbayar oleh keuntungan pan/zoom yang tidak kita butuhkan.

### C. react-simple-maps (D3-based React wrapper)

Pro: deklaratif, sudah React-native, support SSR di Next.js.

Kontra:
- Bergantung pada `d3-geo` (~30KB) dan `d3-zoom` walaupun zoom dimatikan; tree
  shaking tidak sempurna untuk pemakaian "render only".
- API mendorong setiap Geography sebagai komponen — lebih banyak React node per
  region, hydration cost lebih besar.
- Selection model komponennya menggunakan state lokal; integrasi URL-search-params
  butuh patch.

Ditolak: kelebihan deklaratif tidak sebanding dengan ~50KB tambahan untuk
fungsionalitas yang sudah kita capai dalam ~3KB kode sendiri.

### D. d3-geo langsung tanpa wrapper

Pro: proyeksi yang benar (Mercator/Albers) bila kelak butuh.

Kontra:
- `d3-geo` ~25KB gzipped untuk satu fungsi yang kita pakai (`geoPath`).
- Distorsi Mercator pada lintang ekuator Indonesia tidak lebih akurat secara
  visual dibanding equirectangular sederhana untuk kepentingan choropleth.

Ditolak: nilai marginal tidak sebanding dengan tambahan dependency.

## Konsekuensi

### Positif

- **Bundle klien ~0KB tambahan**. Hanya `<MapViewer>` (event delegation, < 1KB
  gzipped) yang ship sebagai client JS.
- **First paint adalah server HTML**. LCP terjadi sebelum hydration; perangkat
  low-end tidak menunggu paint WebGL.
- **SEO-friendly**. Crawler melihat poligon, kategori warna, dan label region
  sebagai HTML statis.
- **URL adalah state**. Bookmarkable, shareable, Back/Forward bekerja, dan testable
  dari e2e tanpa interaksi peta nyata.
- **Re-render server**. Panel detail dan slider tahun me-re-fetch data via RSC,
  konsisten dengan pattern halaman lain.
- **Tidak ada vendor lock-in**. Bila kelak butuh MapLibre, layer baru bisa
  dipasang di samping SVG (atau menggantinya) tanpa membongkar use case.

### Negatif (diterima)

- **Tanpa pan/zoom**. Bila user ingin memperbesar pulau kecil (mis. Maluku Utara),
  ia tidak bisa. Mitigasi: panel detail menampilkan data lengkap; selection list
  pada panel (future) bisa menjadi navigasi alternatif.
- **Distorsi areal ~2% di ujung lintang**. Tidak terlihat untuk choropleth, tetapi
  area visual region utara/selatan agak melar. Tidak boleh dipakai untuk
  pengukuran luas.
- **Hover di mobile** tidak ada. Mitigasi: tap = selection (sama dengan tujuan
  hover di desktop).
- **Update geometri membutuhkan re-import**. GeoJSON diubah upstream lewat skrip,
  bukan diunggah lewat UI — sesuai ADR-0001 §8 (data publik di-import via skrip).

## Kepatuhan terhadap project guidelines

- §2.13 "Built responsive from the start": grid `lg:grid-cols-[minmax(0,2.4fr)_minmax(20rem,1fr)]`
  menyusun map kiri + kontrol kanan di desktop, tumpuk vertikal di mobile.
- §7 Performance budget: tidak menambah dependency runtime → bundle tetap di bawah
  anggaran.
- §9 Responsive design: viewBox SVG bersifat fluid; semua kontrol memenuhi touch
  target 44×44px.
- §10 Design tokens: warna dari `CATEGORY_FILL_CLASS` (tokens `ordinal.rendah/
  sedang/tinggi`), tidak ada hex inline.
- §11 State triplet: empty state ketika boundaries belum di-import, ketika
  predictions kosong, dan ketika belum ada wilayah dipilih.
- §13 Caching: page `dynamic = "force-dynamic"`; data freshness lewat cache tag
  dari use case (`region:boundaries`, `region:indicators:<tahun>`,
  `model:predictions:<version>:<tahun>`).
- §20 Accessibility: tiap region adalah anchor `<a>` dengan label deskriptif,
  fokus visible, kontras kategori ≥ 4.5:1.

## Tindak lanjut

- Bila adopsi mengungkap kebutuhan pan/zoom (mis. feedback user "Maluku terlalu
  kecil"), ADR baru mengevaluasi:
  (a) menambah kontrol "Fokus pulau" URL-driven berbasis sub-bbox, atau
  (b) migrasi ke MapLibre dengan `MapPaths` server tetap dipakai sebagai
  fallback no-JS.
- Bila riset menambahkan layer non-region (mis. titik fasilitas kesehatan), ADR
  baru menetapkan apakah cukup `<circle>` di SVG yang sama atau saatnya layer
  raster.
- Skrip `import-boundaries` mempertahankan tingkat simplifikasi geometri saat ini
  (~10×); penurunan kualitas geometri lebih jauh perlu visual review.
