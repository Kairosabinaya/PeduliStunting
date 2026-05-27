# Peduli Stunting — Build Plan & Staged Prompts untuk Claude Code

Dokumen ini dipakai berurutan. Selesaikan Bagian 1 dulu, lalu paste prompt di Bagian 3
satu per satu ke Claude Code (jangan sekaligus). Setiap prompt sengaja singkat supaya
Claude Code mengeksplorasi `project guidelines` dan file sumber sendiri, lalu menyusun rencananya.

---

## Bagian 1 — Persiapan dari kamu (sekali di awal)

Lakukan ini sebelum Stage 0.

1. **Taruh file sumber di repo** pada folder `docs/source/`:
   - `Dataset.xlsx` (data peta: region x tahun, Y, Y1, X1-X20)
   - `Bab4.docx` (laporan model GTWENOLR untuk dashboard)
   - `buku-kia-2024.pdf` (rujukan edukasi dan tracker)
   - `lookup_kabkota_shapefile.csv` dan `indo_kabkota_2023.gpkg` (batas wilayah untuk choropleth)
   - File besar (`.pdf`, `.gpkg`) masukkan ke `.gitignore` tapi tetap simpan lokal supaya Claude Code bisa membacanya.

2. **Logo**: pastikan sudah ada di `public/brand/` (icon/horizontal/stacked x black/color/white). Sudah kamu lakukan.

3. **Supabase**:
   - MCP sudah terhubung ke Claude Code. Bagus.
   - Siapkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` (dari Project Settings > API). Nanti dimasukkan ke `.env.local` saat Stage 1.
   - Aktifkan provider **Google** di Authentication > Providers (butuh OAuth Client ID dan Secret dari Google Cloud Console, plus redirect URL yang ditunjukkan Supabase).

4. **Ekspor dari R** (CSV, taruh di `docs/source/model-exports/`) — dibutuhkan saat Stage peta dan dashboard, bukan sekarang:
   - `model_predictions.csv`: per kode_bps x tahun, kolom predicted_category dan prob_rendah, prob_sedang, prob_tinggi.
   - `model_metadata.csv` atau JSON: nama model, versi, hyperparameter (hs, ht, lambda, theta), metrik (akurasi, QWK, MAE, log-score), Moran's I per tahun.
   - `model_coefficients.csv` (opsional, untuk fitur what-if slider): koefisien GTWOLR (untuk inferensi) atau ringkasan koefisien lokal GTWENOLR per prediktor.

5. **WHO Child Growth Standards (LMS)** untuk hitung z-score tracker — taruh di `docs/source/who-standards/` sebagai CSV: indikator (bb_u, tb_u, bb_tb, lk_u), jenis_kelamin, umur, L, M, S. Sumber resmi WHO; Kemenkes memakai standar yang sama.

6. **Konten edukasi**: tidak perlu disiapkan manual. Claude Code akan seed struktur dan stub dari Buku KIA; kamu sempurnakan teksnya belakangan lewat data, bukan hardcode.

> Catatan dataset: dataset punya 540 kab/kota, tetapi model di Bab4 memakai 514 (panel tidak seimbang, a.l. pemekaran Papua). Saat Stage backend, minta Claude Code menyimpan keduanya apa adanya dan menandai region yang tidak punya prediksi model, jangan dipaksa cocok.

---

## Bagian 2 — Konteks aplikasi (ringkas, supaya prompt bisa pendek)

**Peduli Stunting** adalah web app (Next.js App Router + Supabase, aturan penuh di `project guidelines`).

Alur dan halaman:
- **Landing** (publik): hero + CTA Register / Login.
- **Auth**: email/password + Google OAuth (Supabase Auth).
- **Map** (setelah login): choropleth kab/kota seluruh Indonesia, slider tahun 2021-2024, warna per kategori stunting ordinal (Rendah hijau, Sedang kuning, Tinggi merah), panel detail wilayah saat diklik (skor prevalensi, kategori, riwayat antar tahun, toggle prediksi model). Pola mirip screenshot referensi, tapi konteks stunting.
- **Edukasi** (login): artikel edukasi stunting berbasis Buku KIA, dikategorikan per topik dan rentang usia anak.
- **Tracker** (login): pemantauan pertumbuhan anak personal berbasis Buku KIA — profil anak, pencatatan antropometri (BB, TB/PB, LK, LiLA), z-score otomatis (BB/U, TB/U = indikator stunting, BB/TB, LK/U) dengan klasifikasi SD, kurva pertumbuhan vs standar WHO, ceklis imunisasi, ceklis perkembangan per usia.
- **Dashboard** (login): penjelasan model GTWENOLR + visualisasi prediktor + slider what-if.
- **Account** (login): profil dan logout.
- **Floating header** menavigasi Map / Dashboard / Edukasi / Tracker / Account.

Fakta data peta (dari `Dataset.xlsx`):
- Kolom: ID, Kode_BPS, Provinsi, Kabupaten_Kota, Tipe, Tahun, Latitude, Longitude, Y (kategori ordinal), Y1 (prevalensi persen), X1-X20.
- Dimensi prediktor: X1-X7 Sosial-Ekonomi, X8-X9 Pendidikan, X10-X13 Kesehatan, X14-X15 Ketahanan Pangan, X16-X18 Konsumsi Pangan, X19-X20 Gender. Sheet "Source" berisi nama dan keterangan tiap variabel.

Fakta model (dari `Bab4`, untuk dashboard):
- Model final: GTWENOLR bandwidth adaptif. Out-of-sample: akurasi 0.716, QWK 0.696, MAE 0.287, log-score -0.645; selisih in/out ~0.001.
- Perbandingan akurasi out-of-sample: OLR 0.589, ENOLR 0.589, GWOLR 0.640, GTWOLR 0.642, GTWENOLR tetap 0.659, GTWENOLR adaptif 0.716.
- 3 kelas ordinal (Rendah, Sedang, Tinggi). Rata-rata 13.24 dari 20 prediktor aktif per wilayah (seleksi lokal). Konvensi: koefisien positif mengarah ke status lebih baik. Prediktor protektif konsisten X6, X16, X15; faktor risiko X12, X13, X2. Inferensi formal di GTWOLR (bukan koefisien terpenalti).

---

## Bagian 3 — Staged prompts (paste satu per satu)

### Stage 0 — Orientasi dan rencana arsitektur (belum ada kode app)

```
Baca project guidelines sepenuhnya, lalu baca file di docs/source/ (Dataset.xlsx termasuk sheet
Source, Bab4.docx, buku-kia-2024.pdf, dan lookup/gpkg batas wilayah). Pelajari juga
Bagian 2 di docs/build-plan jika ada.

Tugasmu di tahap ini hanya merancang, belum menulis kode aplikasi. Hasilkan:
1. Rencana arsitektur empat lapis sesuai project guidelines untuk aplikasi "Peduli Stunting".
2. Model domain lengkap: daftar entity, value object, dan rancangan tabel database
   (regions, indikator per tahun, kamus variabel, prediksi model, metadata model,
   artikel edukasi, anak, pengukuran pertumbuhan, standar pertumbuhan WHO, jadwal
   imunisasi, ceklis perkembangan, profil user). Tandai mana data publik (read-only)
   dan mana data milik user.
3. Peta route dan halaman (landing publik; auth; map, edukasi, tracker, dashboard,
   account terproteksi) beserta strategi caching awal per route.
4. Daftar dependency yang akan dipasang.

Tulis hasilnya ke docs/STATE.md, docs/GLOSSARY.md (canonical istilah: kabupaten_kota,
prevalensi, stunting, z-score, dll), dan docs/adr/0001-arsitektur.md. Jangan menulis
kode aplikasi dulu. Setelah selesai, tunjukkan ringkasannya dan minta persetujuanku.
```

### Stage 1 — Scaffold proyek dan tooling

```
Setujui rencana di STATE.md. Sekarang inisialisasi proyek sesuai project guidelines:
Next.js (App Router) + TypeScript strict, pnpm. Pasang dan konfigurasi semua tooling:
Supabase (client server dan browser), Tailwind dengan design token, Zod, react-hook-form,
Vitest + Testing Library, Playwright, Sentry, Pino, Husky + lint-staged + commitlint,
ESLint + Prettier.

Khusus design token: buat palette dari off-white, off-black, #095f96 (primary),
#4aa5df (primary muda), #6fbe8d (aksen hijau), plus skala warna ordinal terpisah untuk
peta (hijau Rendah, kuning Sedang, merah Tinggi). Dukung light/dark via CSS variables.
Pakai logo dari public/brand (horizontal-color untuk header light, horizontal-white untuk
header dark, icon untuk favicon).

Bangun struktur folder empat lapis, composition root kosong, validasi env via Zod di
src/config/env.ts, dan Result type. Pastikan pnpm lint, typecheck, dan build lulus tanpa
warning. Update STATE.md. Belum perlu membangun halaman.
```

### Stage 2 — Fondasi backend (skema DB, auth, seed) — backend dulu

```
Fokus backend dulu, tanpa UI. Lewat Supabase MCP, rancang dan terapkan migration untuk
SEMUA tabel sesuai rancangan STATE.md, ikuti Migration Sequence Protocol di project guidelines
(migration -> gen types -> Zod -> repository port + impl -> use case -> STATE/GLOSSARY).

Cakupan tabel minimal:
- profiles (terkait auth)
- regions (kode_bps, provinsi, kabupaten_kota, tipe, lat, long, centroid/geometry)
- indicator_dictionary (kode X/Y, dimensi, nama, satuan, arah pengaruh)
- region_indicators (region, tahun, y_category ordinal, y1_prevalence, x1..x20)
- model_metadata (nama, versi, hyperparameter, metrik, moran per tahun)
- model_predictions (region, tahun, predicted_category, prob per kelas)
- education_articles (kategori, rentang usia, isi, rujukan Buku KIA)
- children (user, nama, tanggal lahir, jenis kelamin, berat lahir, usia gestasi)
- growth_measurements (child, tanggal, usia bulan, bb, tb, lk, lila)
- growth_standards (indikator, jenis kelamin, umur, L, M, S) untuk z-score
- immunization_schedule + child_immunizations
- milestones + child_milestones

Aktifkan RLS pada semua tabel: data wilayah/indikator/prediksi/edukasi/standar/jadwal
boleh dibaca publik (authenticated), data anak/pengukuran/imunisasi/milestone hanya milik
user pemiliknya. Generate types, buat Zod schema, repository port + implementasi Supabase,
dan use case untuk jalur baca. Seed data statis/rujukan: indicator_dictionary, model_metadata,
growth_standards (dari docs/source/who-standards), immunization_schedule, milestones, dan
stub education_articles dari Buku KIA. Hitung z-score di server (lapisan domain), bukan hardcode.

Buat juga script import yang bisa kujalankan untuk memuat data dinamis (jangan hardcode):
- import Dataset.xlsx -> regions + region_indicators
- import docs/source/model-exports -> model_predictions + lengkapi model_metadata
- import batas wilayah (gpkg/csv) -> simpan sebagai GeoJSON tersederhanakan untuk choropleth

Tulis test di tiap lapis. Update STATE.md dan GLOSSARY.md. Tunjukkan instruksi menjalankan
script import-nya.
```

### Stage 3 — Fondasi frontend (semua halaman + navigasi + design system)

```
Bangun kerangka aplikasi end-to-end tapi belum poles per halaman. Sesuai project guidelines
(desktop-primary, responsive dari awal, state triplet loading/error/empty wajib, primitive
library, tanpa hardcode):

1. Root layout, theme provider (light/dark), dan floating header (Map, Dashboard, Edukasi,
   Tracker, Account) yang muncul hanya di area terproteksi.
2. Auth gating: landing dan halaman auth publik; map/edukasi/tracker/dashboard/account
   terproteksi via middleware + cek sesi di server.
3. Primitive library di src/components/primitives (Button, Input, Select, Card, Modal,
   Skeleton, ErrorState, EmptyState, dst) dengan cva dan TSDoc @example.
4. Scaffold SEMUA halaman dengan layout nyata, terhubung ke use case baca dari Stage 2,
   menampilkan data asli jika ada dan empty state yang benar jika belum:
   - Landing: hero + CTA Register/Login.
   - Auth: form email/password + tombol Google OAuth.
   - Map, Edukasi, Tracker, Dashboard, Account: shell fungsional yang menarik data dari DB.

Verifikasi responsif di 360, 768, 1440. Pastikan lint/typecheck/test/build lulus. Update STATE.md.
```

### Stage 4 — Iterasi per halaman (paste berurutan, satu halaman per giliran)

Urutan: **Landing -> Auth -> Map -> Edukasi -> Tracker -> Dashboard -> Account.**

Template per halaman (ganti `<HALAMAN>` dan baris sumbernya):

```
Bawa halaman <HALAMAN> ke kualitas produksi sesuai project guidelines: wiring backend penuh,
semua state (loading/error/empty), responsif desktop-primary terverifikasi di 360/768/1440,
aksesibilitas WCAG AA, dalam anggaran performa, plus test (unit/komponen/e2e jalur utama).
Eksplorasi file sumber yang relevan sebelum mulai. Update STATE.md dan GLOSSARY.md bila ada
perubahan struktur atau istilah. Jangan ada hardcode; semua dari DB.

Sumber/acuan khusus halaman ini: <SUMBER>
```

Isi `<SUMBER>` per halaman:
- **Landing**: brand di public/brand, palette, value proposition Peduli Stunting (peta + edukasi + tracker + dashboard model).
- **Auth**: Supabase Auth email/password + Google OAuth, redirect ke Map setelah login, handling error ramah.
- **Map**: GeoJSON batas wilayah hasil import, tabel region_indicators (Y, Y1, X1-X20) dan model_predictions; slider tahun 2021-2024; legenda 3 kelas ordinal (hijau/kuning/merah); panel detail wilayah dengan riwayat antar tahun dan toggle prediksi model. Performa: sederhanakan geometri, lazy-load layer berat.
- **Edukasi**: education_articles dari Buku KIA, navigasi per topik dan rentang usia; konten dari DB.
- **Tracker**: children + growth_measurements; hitung z-score via growth_standards (BB/U, TB/U=stunting, BB/TB, LK/U) dengan klasifikasi SD Buku KIA; kurva pertumbuhan vs standar WHO; ceklis imunisasi dan perkembangan per usia. Semua per-user lewat RLS.
- **Dashboard**: model_metadata + model_predictions; tampilkan perbandingan 6 model dan metrik final (akurasi 0.716, QWK 0.696, dll), Moran's I per tahun, kamus prediktor per dimensi, kontribusi prediktor (protektif X6/X16/X15, risiko X12/X13/X2), dan slider what-if prediktor. Untuk what-if butuh model_coefficients hasil ekspor; jika belum ada, tampilkan mode penjelasan dulu dan beri empty state yang jelas.
- **Account**: profil dan logout.

---

## Catatan dependensi antar stage

- **Stage 2 (import data peta)**: butuh `Dataset.xlsx` dan batas wilayah sudah di `docs/source/`. Sudah tersedia.
- **Stage 4 Map**: butuh `model_predictions.csv` (untuk toggle prediksi) — kalau belum diekspor, peta tetap jalan dengan data resmi (Y/Y1) dan toggle prediksi diberi empty state.
- **Stage 4 Tracker**: butuh `who-standards` CSV untuk z-score. Kalau belum ada, tracker tetap mencatat pengukuran tapi klasifikasi z-score diberi empty state sampai standar di-seed.
- **Stage 4 Dashboard**: butuh `model_metadata` dan idealnya `model_coefficients` untuk what-if. Penjelasan model dan metrik bisa jalan dari metadata; slider what-if menyusul setelah koefisien diekspor.

Semua dependensi yang belum siap ditangani lewat empty state (bukan hardcode), sesuai aturan
state triplet di project guidelines, jadi aplikasi tetap utuh dan tidak terlihat rusak saat data menyusul.
