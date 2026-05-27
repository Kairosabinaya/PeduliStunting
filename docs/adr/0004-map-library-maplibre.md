# ADR-0004 — Map renderer: MapLibre GL JS + react-map-gl (supersedes ADR-0002)

- **Status:** Accepted
- **Tanggal:** 2026-05-27
- **Author:** Kairos Abinaya Susanto
- **Supersedes:** [ADR-0002](./0002-map-renderer.md)

## Konteks

ADR-0002 memilih SVG choropleth hand-rolled untuk meminimalkan bundle JS dan
optimasi LCP di perangkat menengah-bawah. Setelah halaman dirilis, user
testing (review oleh Claude-in-Chrome + feedback langsung pengguna) menemukan
limitasi yang lebih besar dari nilai bundle savings:

1. **Tidak ada pan/zoom**. Pulau-pulau kecil (Maluku, NTT, Papua Barat Daya)
   tidak bisa dilihat detailnya. Mitigasi ADR-0002 ("panel detail menampilkan
   data lengkap") tidak menutupi kebutuhan eksplorasi spasial.
2. **Tidak ada basemap kontekstual**. Peta terasa seperti choropleth mengambang
   di void putih. Pengguna kehilangan konteks geografis (laut, negara
   tetangga, label kota).
3. **Tidak ada snap-back behavior**. Aplikasi referensi (Google Maps,
   GeoPangan) memungkinkan pengguna menggeser kamera ke seluruh dunia tapi
   tetap "ditarik kembali" ke Indonesia bila terlalu jauh.
4. **Visual quality**. Choropleth statis SVG terlihat "academic". Pengguna
   mengharapkan kualitas visual setara Apple Maps / Google Maps untuk
   landing page utama aplikasi.

Sumber feedback eksplisit (Claude-in-Chrome review, 27 Mei 2026):
> "Peta TIDAK fill viewport ujung ke ujung. Area laut PUTIH POLOS — Indonesia
> jadi terasa 'mengambang di kanvas kosong' bukan 'di atas peta'."

> "Tidak bisa digeser-geser, seharusnya ini world map, tapi ketika not a
> single part of indonesia yang muncul di layar, dia bakal narik balik ke
> indo." (feedback user langsung)

## Keputusan

Migrasi renderer peta ke **MapLibre GL JS** via React wrapper **react-map-gl**.
Basemap: **OpenFreeMap** style `positron` (vector tiles, gratis, tanpa API
key, light theme cocok dengan Apple-style glassmorphism).

Komposisi pattern:

```
src/components/features/map/
├── map-canvas.tsx          // CLIENT: react-map-gl <Map> + GeoJSON Source/Layer
├── map-data.ts             // pure helpers + toFeatureCollection() → GeoJSON
├── map-legend.tsx          // SERVER: legenda kategori (tidak berubah)
├── map-search-params.ts    // URL state (tidak berubah)
├── vertical-year-rail.tsx  // CLIENT: year picker (tidak berubah)
├── regional-summary-card.tsx, stunting-info-card.tsx, …
└── region-detail-popup.tsx // SERVER: detail wilayah (tidak berubah)
```

### Detail penting

1. **OpenFreeMap basemap**. Style `https://tiles.openfreemap.org/styles/positron`
   tidak butuh API key, hosted di CloudFront, gratis untuk produksi. Style
   `positron` adalah varian light yang minimal — sesuai dengan glass panels
   di atas.

2. **GeoJSON layer driven oleh server-fetched data**. `toFeatureCollection()`
   menjelaskan boundaries + indicator + prediction yang sudah di-join di
   server menjadi FeatureCollection dengan property `actualCategory` dan
   `predictedCategory`. Klien tidak melakukan agregasi data.

3. **Choropleth via data-driven paint**. Fill color memakai MapLibre
   expression `["match", ["get", "actualCategory"], "Rendah", colorRendah,
   …]`. Token CSS variables (`--color-ordinal-rendah/sedang/tinggi`) diambil
   sekali via `getComputedStyle`, dan re-resolve via `MutationObserver` di
   `<html data-theme>` untuk dark mode.

4. **Snap-back behavior**. Pada event `moveend`, hitung apakah viewport
   bounds masih intersect dengan `INDONESIA_RESET_BOUNDS` (`[[92,-13],[142,8]]`).
   Bila tidak intersect, `map.easeTo()` mengembalikan ke `INITIAL_VIEW_STATE`
   (lon=117, lat=-2.5, zoom=4.2) dengan durasi 800ms. Pengguna bisa pan ke
   Eropa/Amerika untuk konteks, tetap ditarik balik bila Indonesia hilang
   dari layar.

5. **Selection via URL**. Klik wilayah memanggil `router.replace` dengan
   param `wilayah=<kodeBps>`. Tetap konsisten dengan pola Server Component
   yang lain — Back/Forward browser dan share-link tetap bekerah.

6. **Feature-state hover**. MapLibre `setFeatureState` memberi kategori
   `hover: true/false` per region, dipakai untuk paint opacity. Tidak ada
   per-region React state (jauh lebih ringan dari 514 React nodes).

7. **Cached data layer**. `src/lib/cached-map-data.ts` membungkus boundaries
   + regions + indicators-by-year + predictions-by-year dengan
   `unstable_cache`. Boundaries (10 MB GeoJSON) hanya di-fetch sekali per
   server boot atau `revalidateTag("region-boundaries")`.

## Trade-off (dibanding ADR-0002)

| Aspek                       | ADR-0002 (SVG)            | ADR-0004 (MapLibre)            |
| --------------------------- | ------------------------- | ------------------------------ |
| Client JS tambahan          | ~0 KB                     | ~190 KB gzipped (MapLibre core)|
| Pan/zoom                    | ❌                        | ✅ GPU-accelerated             |
| Basemap                     | ❌                        | ✅ Vector tiles OpenFreeMap    |
| First paint                 | Server HTML               | Client mount setelah hydration |
| SEO crawl peta              | Indeksable                | Tidak indeksable (canvas)      |
| Mobile low-end performance  | Sangat baik               | Acceptable; WebGL fallback     |
| Snap-back / focus controls  | Tidak relevan             | ✅ via `easeTo` on moveend     |
| Dark mode color sync        | CSS variables langsung    | Re-resolve via MutationObserver|

project guidelines §7 menetapkan budget JS per route < 200 KB transferred. Penambahan
~190 KB dari MapLibre membuat route `/map` mendekati plafon. Mitigasi:

- Bundle MapLibre tidak ter-share dengan route lain (Next.js code-splitting
  per route). Dashboard, Edukasi, Tracker tetap di bawah budget masing-masing.
- `map-canvas.tsx` di-mark `"use client"` sehingga MapLibre hanya di-load saat
  user buka `/map`, bukan di prefetch.

Pengorbanan ini sadar dan dijustifikasi oleh nilai produk: peta adalah
landing page utama; kualitas visual & interaksinya menentukan persepsi user
terhadap seluruh aplikasi.

## Alternatif yang dipertimbangkan ulang

### A. Leaflet + leaflet-choropleth

Pro: ~45 KB gzipped (lebih ringan dari MapLibre).

Kontra:
- DOM-based renderer; 514 polygon di DOM memicu jank pada pan/zoom di low-end Android.
- API yang lebih lama; integrasi dengan React kurang ergonomis.
- Vector tile support via plugin (Maplibre punya itu native).

Ditolak: trade-off bundle savings tidak sebanding dengan smoothness.

### B. deck.gl

Pro: GPU rendering paling cepat, scaling ke jutaan features.

Kontra:
- ~250+ KB gzipped, melewati plafon project guidelines §7 lebih banyak.
- API berorientasi kartografi data ilmiah, learning curve lebih curam.
- Overkill untuk choropleth 514 regions.

Ditolak: overkill untuk kebutuhan saat ini.

### C. Tetap SVG + tambahkan pan/zoom manual

Pro: tidak menambah dependency.

Kontra:
- Implementasi pan/zoom SVG yang halus (pinch-zoom, momentum, snap-back)
  ~3-5x kompleksitas pembuatan komponen sekarang.
- Tetap tidak memberi basemap kontekstual.
- Tidak menutup gap visual "void putih".

Ditolak: development cost > library cost.

## Konsekuensi

### Positif

- Pengguna dapat menjelajah peta dunia dan zoom ke pulau kecil.
- Snap-back mencegah pengguna tersesat (UX safety net).
- Vector basemap memberi konteks (laut biru, negara tetangga ada outline).
- Visual quality setara aplikasi peta komersial.
- `unstable_cache` di sisi server menghilangkan latensi data yang sebelumnya
  membuat tahun-toggle dan region-click terasa lambat.

### Negatif (diterima)

- Bundle JS route `/map` naik dari ~5 KB menjadi ~190 KB. Mitigasi: lazy load
  di client mount; tidak mempengaruhi route lain.
- Peta tidak lagi server-rendered HTML; LCP route `/map` bergeser dari
  ~0.4s ke ~1.2s pada perangkat mid-range. Masih di bawah threshold 2.5s
  (project guidelines §7).
- Crawler tidak melihat polygon (canvas-based). Mitigasi: meta description
  + structured data di server menjelaskan konten peta untuk SEO.
- Membutuhkan jaringan untuk basemap tiles. Mitigasi: tile CDN OpenFreeMap
  punya availability tinggi; failover ke style minimal (background only)
  bila CDN down (todo: implementasi fallback di iterasi berikut).

## Tindak lanjut

- Migrasi `region-detail-panel.tsx` (file lama, masih ada test-nya) ke
  `region-detail-popup.tsx` baru → hapus file lama setelah test diporting.
- Tambahkan custom marker untuk highlight wilayah terpilih (in-progress di
  layer `regions-focus`).
- Lighthouse audit `/map` setelah deploy untuk verifikasi LCP/CLS budget.
- Eksplorasi fallback basemap bila OpenFreeMap CDN down (Maptiler free tier?).
- Bila pengguna butuh peta dunia tanpa basemap (offline mode), bikin style
  minimal `{ version: 8, sources: {}, layers: [{ type: "background", paint }] }`.
