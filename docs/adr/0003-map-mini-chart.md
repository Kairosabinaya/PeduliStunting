# ADR-0003 — Mini history chart: hand-rolled SVG (Nivo deferred to Tracker)

- **Status:** Accepted
- **Tanggal:** 2026-05-27
- **Author:** Kairos Abinaya Susanto
- **Konteks:** Stage 4 — redesign halaman `/map` (panel detail wilayah).

## Konteks

Panel detail di `/map` menampilkan tren 4 titik (2021 – 2024) prevalensi
stunting per kabupaten/kota terpilih. Memori pengguna menyatakan preferensi
**Nivo (`@nivo/line`)** untuk grafik di proyek ini (bukan Recharts/Visx).

Constraint yang mengikat:

1. **Bundle budget < 200KB transferred per route** (project guidelines §7). `@nivo/line`
   gzipped ~70KB + `@nivo/core` ~25KB + d3 transitive ~50KB. Total ~145KB hanya
   untuk satu mini-chart 4 titik.
2. **Konsistensi visual dengan ADR-0002** (peta SVG hand-rolled). Bila peta
   memilih SVG murni untuk konsistensi performa di low-end Android, mini-chart
   yang setara kompleksitasnya layak mengikuti pendekatan yang sama.
3. **Halaman Tracker membutuhkan grafik kurva pertumbuhan WHO** (z-score lintas
   bulan). Itu adalah grafik nyata: 0 – 60 bulan, multi-line WHO standards,
   tooltip, animasi, axes. Nivo tetap pilihan yang tepat di sana.

## Keputusan

- **Map panel detail** memakai mini-chart **SVG hand-rolled** di
  `src/components/features/map/mini-history-chart.tsx` (~80 baris kode,
  ~0 KB tambahan client JS).
- **Tracker (kurva z-score, akan dibangun di iterasi Tracker)** tetap memakai
  **`@nivo/line`** sesuai preferensi awal. Dependency dipasang **saat Tracker
  dibangun**, bukan di iterasi map (menunda pertambahan bundle sampai
  benar-benar dibutuhkan).

## Alternatif yang dipertimbangkan

### A. Pakai Nivo untuk mini-chart map juga

Pro: konsisten satu library di seluruh aplikasi.

Kontra:
- Menambah ~145 KB ke route `/map` yang sudah ramai.
- Animasi/tooltip default Nivo dipakai untuk hanya 4 titik — overhead
  feature yang tidak dipakai.
- Memerlukan dynamic import (`next/dynamic`) supaya tidak menambah bundle
  initial; itu memunculkan loading state untuk grafik 4 titik yang tidak
  berarti.

Ditolak: rasio biaya/manfaat kurang untuk mini-chart sederhana.

### B. Pakai Recharts (sudah ada di `dependencies`)

Pro: tidak perlu install dependency baru.

Kontra:
- Bertentangan dengan memori preferensi pengguna (Nivo).
- Bundle Recharts cukup besar (~80 KB) — sama mahalnya untuk 4 titik.
- Recharts saat ini tidak terpakai aktif; mempertahankannya sebagai
  dependency justru menambah surface attack tanpa imbalan.

Ditolak: tidak lebih ringan dari opsi A, dan melawan preferensi pengguna.

### C. Skip mini-chart, hanya tabel YoY

Pro: paling ringan.

Kontra:
- Tabel saja kurang ekspresif untuk membaca tren.
- Inspirasi GeoPangan menempatkan mini-chart sebagai bagian penting dari
  panel detail; menghilangkannya menurunkan kualitas perceptual UI.

Ditolak: trade-off kualitas visual terlalu besar.

## Konsekuensi

### Positif

- Mini-chart **+0 KB** terhadap bundle client.
- Server-rendered SVG → LCP tidak terpengaruh, crawler-friendly.
- Konsisten dengan ADR-0002 (peta SVG hand-rolled).
- Tracker tetap bebas mengambil Nivo saat siap.

### Negatif (diterima)

- Maintainer perlu membaca SVG primitives untuk modifikasi (vs API Nivo).
  Mitigasi: helper terisolasi di satu file <100 baris, tes komponen
  mendokumentasikan perilaku.
- Tidak ada animasi/tooltip default. Untuk 4 titik diam, tidak diperlukan.
- Bila kelak dibutuhkan tooltip rinci atau axis tick lainnya, akan
  mempertimbangkan migrasi ke Nivo di sini juga (ADR baru).

## Kepatuhan project guidelines

- §1 Locked stack: chart library diumumkan `Recharts ATAU visx` di STATE.md
  §7.1. ADR ini menetapkan **Nivo untuk Tracker** dan **SVG hand-rolled untuk
  micro-chart map** sebagai jalur preferred; STATE.md akan diperbarui.
- §7 Performance budget: pendekatan ini memenuhi budget tanpa kompromi.
- §10 Design tokens: warna dari token `CATEGORY_TEXT_CLASS` / `CATEGORY_BG_CLASS`,
  tidak ada hex inline.
- §11 State triplet: empty state ("Belum ada data riwayat") sudah ditangani.

## Tindak lanjut

- Pasang `@nivo/core` + `@nivo/line` saat membangun halaman Tracker (kurva
  pertumbuhan WHO). Tambahkan di `package.json` dengan ADR follow-up bila
  diperlukan.
- Bila pengguna meminta tooltip interaktif di mini-chart map, ADR baru akan
  mengevaluasi migrasi ke Nivo atau penambahan tooltip native SVG.
