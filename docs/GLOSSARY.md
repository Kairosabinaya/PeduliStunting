# Domain Glossary — Peduli Stunting

Kamus istilah kanonik untuk seluruh codebase. Setiap istilah memiliki SATU bentuk untuk DB
(`snake_case`), variabel TS (`camelCase`), tipe/kelas TS (`PascalCase`), dan label UI
(Bahasa Indonesia). Setiap istilah baru yang masuk ke kode HARUS ditambahkan di sini pada
PR yang sama.

> Aturan emas: jangan pernah memperkenalkan sinonim baru untuk istilah yang sudah ada
> di sini. Kalau butuh nuansa berbeda, tambahkan entri baru, jangan ubah yang lama.

---

## A. Wilayah & Administratif

### Region

- **DB column:** `regions` (tabel), `region_id` (foreign key)
- **TS variable:** `region`, `regionId`
- **TS type:** `Region`, `RegionId` (branded `string`)
- **UI label:** "Wilayah"
- **Definisi:** Entitas geografis administratif level kabupaten/kota di Indonesia. Sumber kanonik adalah Kode BPS 4 digit.

### Kabupaten/Kota

- **DB column:** `kabupaten_kota`
- **TS variable:** `kabupatenKota`
- **TS type:** `KabupatenKota` (alias `string`)
- **UI label:** "Kabupaten/Kota"
- **Definisi:** Pembagian administratif tingkat kedua di Indonesia. Nilai mengikuti penamaan resmi BPS (tanpa awalan "Kota" untuk kabupaten, dengan awalan "Kota" untuk kota).

### Provinsi

- **DB column:** `provinsi`
- **TS variable:** `provinsi`
- **TS type:** `Provinsi` (alias `string`)
- **UI label:** "Provinsi"
- **Definisi:** Pembagian administratif tingkat pertama di Indonesia. 38 entri per tahun di dataset.

### Tipe (wilayah)

- **DB column:** `tipe`
- **TS variable:** `tipe`
- **TS type:** `RegionType = "Kabupaten" | "Kota"`
- **UI label:** "Tipe Wilayah"
- **Definisi:** Klasifikasi region menjadi Kabupaten atau Kota. Diambil apa adanya dari kolom `Tipe` di Dataset.xlsx.

### Kode BPS

- **DB column:** `kode_bps`
- **TS variable:** `kodeBps`
- **TS type:** `KodeBps` (branded `string`, 4 karakter, contoh `"1101"`)
- **UI label:** "Kode BPS"
- **Definisi:** Identifier numerik 4 digit dari Badan Pusat Statistik yang mengidentifikasi kabupaten/kota secara unik nasional. SATU-SATUNYA kunci pencocokan antara dataset indikator, prediksi model, dan batas wilayah (shapefile).

### Centroid

- **DB column:** `latitude`, `longitude` (di `regions`)
- **TS variable:** `centroid: { lat: number; lng: number }`
- **TS type:** `Centroid`
- **UI label:** "Koordinat"
- **Definisi:** Titik representatif wilayah untuk pin/tooltip peta. Diambil dari kolom Latitude/Longitude Dataset.xlsx.

### Geometri Wilayah

- **DB column:** `region_boundaries.geometry` (GeoJSON tersederhanakan)
- **TS variable:** `boundary`
- **TS type:** `RegionBoundary`
- **UI label:** "Batas Wilayah"
- **Definisi:** Poligon batas administratif untuk choropleth. Disimpan sebagai GeoJSON yang telah disederhanakan (topologi-aware) untuk performa di Slow 3G. Sumber: `indo_kabkota_2023.gpkg`.

---

## B. Stunting & Indikator

### Stunting

- **DB column:** (konsep, bukan kolom tunggal)
- **TS variable:** `stunting`
- **TS type:** `Stunting` (namespace untuk konstanta terkait)
- **UI label:** "Stunting"
- **Definisi:** Kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis sehingga panjang/tinggi badan anak lebih pendek dari standar usia (Z-score TB/U < -2 SD menurut WHO Child Growth Standards).

### Prevalensi (Stunting)

- **DB column:** `y1_prevalence` (di `region_indicators`)
- **TS variable:** `prevalence`
- **TS type:** `Prevalence` (branded `number`, 0-100, satuan persen)
- **UI label:** "Prevalensi Stunting"
- **Definisi:** Persentase balita stunting pada satu wilayah dalam satu tahun. Sumber: SSGI/SKI (Kemenkes). Kolom asli di Dataset: `Y1`. Nilai disimpan sebagai persen (mis. `25.9`), BUKAN proporsi.

### Kategori Stunting (Ordinal)

- **DB column:** `y_category` (di `region_indicators`)
- **TS variable:** `stuntingCategory`
- **TS type:** `StuntingCategory = "Rendah" | "Sedang" | "Tinggi"`
- **UI label:** "Kategori Stunting"
- **Definisi:** Klasifikasi ordinal prevalensi stunting per kabupaten/kota. Kolom asli di Dataset: `Y`. Skema warna kanonik: Rendah=hijau, Sedang=kuning, Tinggi=merah. Skema warna ini hidup sebagai design token, bukan hardcode.

### Riwayat Indikator Wilayah

- **DB column:** —
- **TS variable:** `history` (di route), use case: `listRegionIndicatorsHistory`
- **TS type:** `readonly RegionIndicatorsDto[]`
- **UI label:** "Riwayat indikator wilayah" / tabel "Tahun" pada panel detail peta.
- **Definisi:** Kumpulan baris `region_indicators` untuk satu `kodeBps` lintas seluruh tahun yang tersedia (dipakai oleh panel detail `/map`). Use case `ListRegionIndicatorsHistoryUseCase` (`src/application/region/use-cases/list-region-indicators-history.ts`) memanggil `RegionIndicatorsRepository.findByRegion`.

### Riwayat Prediksi Wilayah

- **DB column:** —
- **TS variable:** `predictionHistory`, use case: `listPredictionsByRegion`
- **TS type:** `readonly ModelPredictionDto[]`
- **UI label:** Kolom "Prediksi" pada tabel riwayat tahun panel detail peta.
- **Definisi:** Kumpulan baris `model_predictions` untuk satu `(modelVersion, kodeBps)` lintas tahun. Use case `ListPredictionsByRegionUseCase` (`src/application/model/use-cases/list-predictions-by-region.ts`) memanggil `ModelPredictionRepository.findByVersionAndRegion`. Memungkinkan tabel side-by-side observasi vs prediksi di panel detail.

### Indikator Wilayah

- **DB column:** `region_indicators` (tabel)
- **TS variable:** `regionIndicator`
- **TS type:** `RegionIndicator`
- **UI label:** "Indikator Wilayah"
- **Definisi:** Snapshot satu kabupaten/kota pada satu tahun: prevalensi, kategori ordinal, dan 20 prediktor X1..X20.

### Prediktor (X1..X20)

- **DB column:** `x1`..`x20` (di `region_indicators`) + tabel `indicator_dictionary`
- **TS variable:** `predictors`, `predictorCode`
- **TS type:** `PredictorCode = \`X${number}\``(literal`"X1"`..`"X20"`)
- **UI label:** "Prediktor"
- **Definisi:** Variabel independen pada model stunting. Disimpan sebagai kolom numerik bernama `x1..x20`. Metadata (nama lengkap, dimensi, satuan, sumber, tautan) hidup di `indicator_dictionary`, BUKAN di-hardcode di UI.

### Dimensi Prediktor

- **DB column:** `dimension` (di `indicator_dictionary`)
- **TS variable:** `dimension`
- **TS type:** `PredictorDimension = "Sosial-Ekonomi" | "Pendidikan" | "Kesehatan" | "Ketahanan Pangan" | "Konsumsi Pangan" | "Gender" | "Stunting"`
- **UI label:** "Dimensi"
- **Definisi:** Pengelompokan tematik prediktor. Sumber: sheet `Source` Dataset.xlsx. X1-X7 Sosial-Ekonomi, X8-X9 Pendidikan, X10-X13 Kesehatan, X14-X15 Ketahanan Pangan, X16-X18 Konsumsi Pangan, X19-X20 Gender.

### Arah Pengaruh Prediktor

- **DB column:** `effect_direction` (di `indicator_dictionary`)
- **TS variable:** `effectDirection`
- **TS type:** `EffectDirection = "protective" | "risk" | "neutral"`
- **UI label:** "Arah Pengaruh"
- **Definisi:** Konvensi proyek (dari Bab4): koefisien positif berarti mengarah ke status lebih baik. Prediktor protektif konsisten: X6, X16, X15. Faktor risiko: X12, X13, X2.

---

## C. Model GTWENOLR

### Model GTWENOLR

- **DB column:** `model_metadata.name`
- **TS variable:** `modelName`
- **TS type:** `ModelName` (alias `string`)
- **UI label:** "Model GTWENOLR"
- **Definisi:** Geographically and Temporally Weighted Elastic Net Ordinal Logistic Regression dengan bandwidth adaptif. Model final di Bab4 dengan akurasi out-of-sample 0.716.

### Versi Model

- **DB column:** `model_metadata.version`
- **TS variable:** `modelVersion`
- **TS type:** `ModelVersion` (branded `string`, contoh `"gtwenolr-adaptive-1.0"`)
- **UI label:** "Versi Model"
- **Definisi:** Identifier model. Setiap perubahan hyperparameter atau data training menghasilkan versi baru, tidak menimpa.

### Hyperparameter

- **DB column:** `model_metadata.hyperparameters` (`jsonb`)
- **TS variable:** `hyperparameters`
- **TS type:** `Hyperparameters = { hs: number; ht: number; lambda: number; theta: number }`
- **UI label:** "Hiperparameter"
- **Definisi:** Pengaturan bandwidth spasial (hs), bandwidth temporal (ht), kekuatan regularisasi (lambda), dan campuran L1/L2 elastic net (theta).

### Metrik Model

- **DB column:** `model_metadata.metrics` (`jsonb`)
- **TS variable:** `metrics`
- **TS type:** `ModelMetrics = { accuracy: number; qwk: number; mae: number; logScore: number }`
- **UI label:** "Metrik Model"
- **Definisi:** Performa out-of-sample model. Final GTWENOLR adaptif: accuracy 0.716, QWK 0.696, MAE 0.287, log-score -0.645.

### QWK (Quadratic Weighted Kappa)

- **DB column:** (`metrics.qwk`)
- **TS variable:** `qwk`
- **TS type:** `number` (0..1)
- **UI label:** "QWK (Kappa Tertimbang Kuadratik)"
- **Definisi:** Skor kesepakatan klasifikasi ordinal yang menghukum jarak antar kategori secara kuadratik. Cocok karena Y ordinal.

### Moran's I

- **DB column:** `model_metadata.moran_per_year` (`jsonb`, map tahun -> nilai)
- **TS variable:** `moranI`, `moranByYear`
- **TS type:** `Record<Year, number>`
- **UI label:** "Indeks Moran (autokorelasi spasial)"
- **Definisi:** Statistik autokorelasi spasial respons Y per tahun. Dipakai sebagai uji prasyarat dan diagnostik.

### Prediksi Model

- **DB column:** `model_predictions` (tabel)
- **TS variable:** `modelPrediction`
- **TS type:** `ModelPrediction`
- **UI label:** "Prediksi Model"
- **Definisi:** Output GTWENOLR per region per tahun: kategori prediksi + probabilitas tiga kelas (rendah/sedang/tinggi). Sumber: `model_predictions.csv` hasil ekspor R.

### Probabilitas Kelas

- **DB column:** `prob_rendah`, `prob_sedang`, `prob_tinggi`
- **TS variable:** `probabilities`
- **TS type:** `ClassProbabilities = { rendah: number; sedang: number; tinggi: number }`
- **UI label:** "Probabilitas Kelas"
- **Definisi:** Probabilitas posterior tiga kategori, jumlah 1.0. Disimpan apa adanya tanpa rounding agar bisa direkonsiliasi dengan output R.

### Koefisien Lokal

- **DB column:** `model_coefficients` (tabel, opsional)
- **TS variable:** `localCoefficients`
- **TS type:** `LocalCoefficient`
- **UI label:** "Koefisien Lokal"
- **Definisi:** Koefisien GTWOLR per region/per tahun (untuk inferensi formal) atau ringkasan koefisien GTWENOLR lokal. Dipakai untuk slider what-if di Dashboard. Boleh kosong; UI menampilkan empty state.

### Ringkasan Koefisien

- **DB column:** —
- **TS variable:** `coefficientSummary`
- **TS type:** `CoefficientSummaryDto` (+ `CoefficientSummaryItemDto`)
- **UI label:** "Ringkasan Koefisien" (internal — tidak ditampilkan langsung)
- **Definisi:** Agregat per-prediktor yang dihitung `summariseCoefficients()` dari semua baris `model_coefficients` versi tertentu (opsional difilter tahun). Berisi rata-rata, min, max, jumlah kabupaten/kota berkontribusi, jumlah sampel, dan flag inferensi. Slider what-if Dashboard mengalikan `meanCoefficient` dengan delta pengguna untuk estimasi pergeseran log-odds.

---

## D. Anak, Pengukuran, dan Standar WHO

### Anak

- **DB column:** `children` (tabel)
- **TS variable:** `child`, `childId`
- **TS type:** `Child`, `ChildId` (branded `string` UUID)
- **UI label:** "Anak"
- **Definisi:** Profil anak yang dipantau oleh seorang user di Tracker. Data milik user (RLS owner-only).

### Jenis Kelamin

- **DB column:** `sex`
- **TS variable:** `sex`
- **TS type:** `Sex = "L" | "P"`
- **UI label:** "Jenis Kelamin" (opsi: "Laki-laki" / "Perempuan")
- **Definisi:** Jenis kelamin biologis anak. Wajib untuk hitung Z-score karena WHO LMS berbeda per jenis kelamin. Disimpan sebagai `L`/`P` agar sejajar dengan label Buku KIA dan WHO.

### Tanggal Lahir

- **DB column:** `birth_date`
- **TS variable:** `birthDate`
- **TS type:** `DateOnly` (string `YYYY-MM-DD`)
- **UI label:** "Tanggal Lahir"

### Berat Lahir

- **DB column:** `birth_weight_kg`
- **TS variable:** `birthWeightKg`
- **TS type:** `Kilograms` (branded `number`)
- **UI label:** "Berat Lahir (kg)"

### Usia Gestasi

- **DB column:** `gestational_age_weeks`
- **TS variable:** `gestationalAgeWeeks`
- **TS type:** `number` (28..42)
- **UI label:** "Usia Kehamilan saat Lahir (minggu)"

### Pengukuran Pertumbuhan

- **DB column:** `growth_measurements` (tabel)
- **TS variable:** `measurement`
- **TS type:** `GrowthMeasurement`
- **UI label:** "Pengukuran"
- **Definisi:** Satu titik pengukuran antropometri pada satu tanggal: BB (kg), TB/PB (cm), LK (cm), LiLA (cm). Data milik user.

### BB (Berat Badan)

- **DB column:** `weight_kg`
- **TS variable:** `weightKg`
- **UI label:** "Berat Badan (kg)"

### TB/PB (Tinggi/Panjang Badan)

- **DB column:** `height_cm`
- **TS variable:** `heightCm`
- **UI label:** "Tinggi/Panjang Badan (cm)"
- **Definisi:** Untuk usia < 24 bulan diukur berbaring (Panjang Badan/PB), untuk usia >= 24 bulan diukur berdiri (Tinggi Badan/TB). Disimpan dalam SATU kolom; flag `measured_lying` (boolean) merekam metode pengukuran.

### LK (Lingkar Kepala)

- **DB column:** `head_circumference_cm`
- **TS variable:** `headCircumferenceCm`
- **UI label:** "Lingkar Kepala (cm)"

### LiLA (Lingkar Lengan Atas)

- **DB column:** `muac_cm`
- **TS variable:** `muacCm`
- **UI label:** "LiLA (Lingkar Lengan Atas, cm)"

### Usia (bulan)

- **DB column:** `age_months` (turunan, ATAU dihitung di domain)
- **TS variable:** `ageMonths`
- **TS type:** `AgeMonths` (branded `number` integer 0..72)
- **UI label:** "Usia (bulan)"
- **Definisi:** Usia anak dalam bulan penuh pada tanggal pengukuran. Lookup standar WHO memakai field ini. Dihitung di domain layer, bukan di SQL, untuk konsistensi rounding.

### Z-Score

- **DB column:** turunan (dihitung), disimpan di `growth_measurements.z_scores` (`jsonb`)
- **TS variable:** `zScore`, `zScores`
- **TS type:** `ZScore` (branded `number`), `ZScoreSet = { bbU: ZScore; tbU: ZScore; bbTb: ZScore; lkU: ZScore }`
- **UI label:** "Z-Score"
- **Definisi:** Standardisasi pengukuran anak terhadap standar WHO menggunakan metode LMS: `Z = ((X/M)^L - 1) / (L * S)` (atau `ln(X/M)/S` saat L=0). Empat indikator: BB/U, TB/U (= stunting), BB/TB, LK/U.

### Klasifikasi SD (Standar Deviasi)

- **DB column:** turunan, disimpan di `growth_measurements.sd_class` (`jsonb`, per indikator)
- **TS variable:** `sdClass`
- **TS type:** `SdClass = "buruk" | "kurang" | "normal" | "lebih" | "obesitas" | "pendek" | "sangat_pendek" | "tinggi" | "kurus" | "sangat_kurus" | "gemuk" | "mikrosefali" | "makrosefali"`
- **UI label:** Bersumber dari `SD_CLASS_DISPLAY` di `src/config/tracker.ts`. Contoh: "Sangat kurang", "Kurang", "Normal", "Lebih", "Obesitas", "Pendek (stunting)", "Sangat pendek (stunting)", "Tinggi", "Kurus (wasting)", "Sangat kurus (wasting)", "Gemuk", "Mikrosefali", "Makrosefali".
- **Definisi:** Klasifikasi z-score per indikator menurut Permenkes No. 2 Tahun 2020 / Buku KIA 2024. Pemetaan kelas → indikator: BB/U menggunakan {buruk, kurang, normal, lebih}; TB/U menggunakan {sangat_pendek, pendek, normal, tinggi}; BB/TB menggunakan {sangat_kurus, kurus, normal, gemuk, obesitas}; LK/U menggunakan {mikrosefali, normal, makrosefali}. Cut-off umum: < -3 SD, -3..-2 SD, -2..+2 SD, +2..+3 SD, > +3 SD.

### Standar Pertumbuhan WHO (LMS)

- **DB column:** `growth_standards` (tabel)
- **TS variable:** `growthStandard`
- **TS type:** `GrowthStandard`
- **UI label:** "Standar Pertumbuhan WHO"
- **Definisi:** Tabel parameter LMS WHO Child Growth Standards: per indikator x jenis kelamin x usia (bulan), kolom `l`, `m`, `s`. Sumber: file CSV `docs/source/who-standards/`. Data publik referensi (read-only).

### Indikator Pertumbuhan

- **DB column:** `growth_standards.indicator`
- **TS variable:** `growthIndicator`
- **TS type:** `GrowthIndicator = "BB_U" | "TB_U" | "BB_TB" | "LK_U"`
- **UI label:** "Indikator Pertumbuhan"
- **Definisi:** BB/U = Berat Badan menurut Umur, TB/U = Tinggi Badan menurut Umur (indikator stunting), BB/TB = Berat Badan menurut Tinggi Badan, LK/U = Lingkar Kepala menurut Umur.

---

## E. Imunisasi & Perkembangan

### Jadwal Imunisasi

- **DB column:** `immunization_schedule` (tabel)
- **TS variable:** `immunization`
- **TS type:** `Immunization`
- **UI label:** "Jadwal Imunisasi"
- **Definisi:** Daftar imunisasi wajib menurut Buku KIA 2024: nama vaksin, dosis, usia rekomendasi (bulan), catatan. Data publik referensi.

### Catatan Imunisasi Anak

- **DB column:** `child_immunizations`
- **TS variable:** `childImmunization`
- **TS type:** `ChildImmunization`
- **UI label:** "Catatan Imunisasi"
- **Definisi:** Status imunisasi anak per kode jadwal + tanggal pemberian opsional + catatan. Data milik user (RLS owner-only).

### Status Imunisasi Anak

- **DB column:** `child_immunizations.status` (CHECK constraint)
- **TS variable:** `immunizationStatus`
- **TS type:** `ChildImmunizationStatus = "pending" | "done" | "skipped"`
- **UI label:** "Belum diberikan" / "Sudah diberikan" / "Dilewati" (lihat `IMMUNIZATION_STATUS_LABEL`)
- **Definisi:** Penanda apakah imunisasi sudah dilakukan, belum, atau sengaja dilewati (mis. kontraindikasi medis). Tidak ada status "dijadwalkan" — jadwal diturunkan dari `immunization_schedule.recommended_age_months` + tanggal lahir anak.

### Milestone Perkembangan

- **DB column:** `milestones` (tabel)
- **TS variable:** `milestone`
- **TS type:** `Milestone`
- **UI label:** "Ceklis Perkembangan"
- **Definisi:** Daftar tonggak perkembangan SDIDTK per rentang usia (`min_age_months`..`max_age_months`) dan per domain (motorik kasar, motorik halus, bahasa, sosial-kemandirian). Sumber: Buku KIA 2024. Data publik referensi.

### Domain Milestone

- **DB column:** `milestones.domain` (CHECK constraint)
- **TS variable:** `milestoneDomain`
- **TS type:** `MilestoneDomain = "gross_motor" | "fine_motor" | "language" | "social"`
- **UI label:** "Motorik kasar" / "Motorik halus" / "Bahasa" / "Sosial & kemandirian" (lihat `MILESTONE_DOMAIN_LABEL`)
- **Definisi:** Empat domain SDIDTK yang menjadi pengelompokan utama di UI ceklis perkembangan. Urutan tampil tetap (gross_motor → fine_motor → language → social).

### Ceklis Milestone Anak

- **DB column:** `child_milestones`
- **TS variable:** `childMilestone`
- **TS type:** `ChildMilestone`
- **UI label:** "Ceklis Anak"
- **Definisi:** Status pencapaian milestone per anak per tanggal cek. Data milik user (RLS owner-only).

### Status Milestone Anak

- **DB column:** `child_milestones.status` (CHECK constraint)
- **TS variable:** `milestoneStatus`
- **TS type:** `ChildMilestoneStatus = "not_checked" | "achieved" | "delayed"`
- **UI label:** "Belum dicek" / "Tercapai" / "Terlambat" (lihat `MILESTONE_STATUS_LABEL`)
- **Definisi:** Penanda apakah milestone sudah dicapai pada usia rekomendasi, belum dicek, atau terlambat (terindikasi keterlambatan perkembangan; UI menampilkan badge tone warning). Saran rujukan klinis di-defer ke Stage 5+.

---

## F. Edukasi

### Artikel Edukasi

- **DB column:** `education_articles`
- **TS variable:** `article`
- **TS type:** `EducationArticle`
- **UI label:** "Artikel Edukasi"
- **Definisi:** Konten edukasi dari Buku KIA 2024 (dan sumber lain Kemenkes), dikategorikan per topik dan rentang usia anak. Data publik (boleh dibaca semua user terautentikasi).

### Topik Edukasi

- **DB column:** `education_articles.topic` (CHECK constraint)
- **TS variable:** `topic`
- **TS type:** `ArticleTopic = "kehamilan" | "persalinan" | "nifas" | "bayi" | "balita" | "gizi" | "imunisasi" | "perkembangan" | "kesehatan_umum"`
- **UI label:** "Topik"
- **Definisi:** Kategori tematik artikel Buku KIA. Enum tunggal di
  `src/domain/education/value-objects/article-topic.ts` (mirror CHECK constraint
  migrasi `20260525120500_education.sql`). Katalog label/deskripsi/badge tone
  hidup di `src/config/education.ts` sehingga UI tetap pure config-driven.

### Rentang Usia Edukasi

- **DB column:** `min_age_months`, `max_age_months` (keduanya `int2` nullable)
- **TS variable:** `ageRange`
- **TS type:** `ArticleAgeRange = { kind: "prenatal" } | { kind: "child"; minAgeMonths: number; maxAgeMonths: number }`
- **UI label:** "Rentang Usia"
- **Definisi:** Filter usia untuk daftar artikel. Artikel dengan kedua kolom
  NULL diperlakukan sebagai konten prakelahiran (kehamilan/persalinan/nifas);
  artikel dengan rentang anak masuk hasil bila rentangnya beririsan dengan
  rentang filter. Preset filter (Prakelahiran, 0-6, 6-12, 12-24, 24-60 bulan)
  hidup di `src/config/education.ts`.

### Filter URL Edukasi

- **DB column:** —
- **TS variable:** `EDUCATION_TOPIC_PARAM` (`topik`), `EDUCATION_AGE_PARAM` (`usia`), `EDUCATION_SEARCH_PARAM` (`cari`), `EDUCATION_PAGE_PARAM` (`halaman`)
- **TS type:** `ParsedEdukasiFilters`
- **UI label:** —
- **Definisi:** Skema search-param halaman `/edukasi`. Parser di
  `src/app/(app)/edukasi/_lib/filters.ts` menerima nilai mentah dari Next.js,
  jatuh ke `undefined` saat nilai tidak dikenali, lalu memetakan ke
  `ArticleListFilter` untuk repository.

---

## G. User & Akun

### Profil User

- **DB column:** `profiles`
- **TS variable:** `profile`
- **TS type:** `Profile`, `UserId` (branded `string` UUID, mirror Supabase `auth.users.id`)
- **UI label:** "Profil"
- **Definisi:** Profil aplikasi terkait `auth.users`. Menyimpan nama tampilan, preferensi tema, dan kolom non-PII lain.

---

## H. Konvensi Lintas-Domain

### Tahun (data peta)

- **DB column:** `tahun`
- **TS variable:** `tahun` (untuk konsistensi dengan data) ATAU `year`
- **TS type:** `Year` (branded `number`, range 2021..2024 saat ini)
- **UI label:** "Tahun"
- **Definisi:** Tahun observasi data SSGI/SKI. Saat ini hanya 2021-2024. Range valid hidup di `src/config/years.ts`, BUKAN di-hardcode di komponen.

### Result

- **DB column:** —
- **TS variable:** `result`
- **TS type:** `Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`
- **UI label:** —
- **Definisi:** Discriminated union untuk operasi yang bisa gagal. Use case dan Server Action mengembalikan `Result`, tidak melempar exception. Sumber tunggal: `src/domain/shared/result.ts`.

### AppError

- **DB column:** —
- **TS variable:** `error`
- **TS type:** `AppError = ValidationError | UnauthorizedError | ForbiddenError | NotFoundError | ConflictError | RateLimitError | ExternalServiceError | UnexpectedError`
- **UI label:** Lihat tabel "Error Taxonomy" di project guidelines Section 12.
- **Definisi:** Taksonomi error tunggal lintas seluruh codebase. Semua kelas turunannya hidup di `src/domain/errors/`.

---

## I. Peta (UI dan URL state)

### Sumber Data Peta

- **DB column:** —
- **TS variable:** `sumber` (URL param), `source` (props)
- **TS type:** `MapSource = "actual" | "predicted"`
- **UI label:** "Data observasi" / "Prediksi model"
- **Definisi:** Mode yang dipilih user untuk warna choropleth di `/map`. `"actual"` memakai kategori `y_category` dari `region_indicators`; `"predicted"` memakai `predicted_category` dari `model_predictions` versi default. Sumber tunggal: `MAP_SOURCES` + `MAP_SOURCE_OPTIONS` di `src/config/map.ts`. Bila user meminta `"predicted"` tetapi prediksi belum di-import, halaman otomatis fallback ke `"actual"` dan menampilkan empty state `noPredictionsTitle`.

### Seleksi Wilayah (Map)

- **DB column:** —
- **TS variable:** `selection` (parse output), URL param: `wilayah`
- **TS type:** `KodeBps | null`
- **UI label:** "Detail wilayah"
- **Definisi:** `kode_bps` wilayah yang sedang dipilih di halaman `/map`, disimpan di URL search param `wilayah` (bukan state lokal). `null` berarti panel detail menampilkan empty state. Klik wilayah pada peta memanggil `router.replace("?wilayah=<kodeBps>", { scroll: false })` lewat `MapViewer`. Close panel = drop param `wilayah`.

### Tahun Aktif Peta

- **DB column:** —
- **TS variable:** `tahun` (URL param + props)
- **TS type:** `Year`
- **UI label:** "Tahun observasi"
- **Definisi:** Tahun yang dipilih user lewat slider di `/map`, disimpan di URL search param `tahun`. Default = `MAX_YEAR` dari `src/config/years.ts`. Slider menulis perubahan via `startTransition` agar interaksi tetap responsif saat re-render server.

### Choropleth

- **DB column:** —
- **TS variable:** —
- **TS type:** —
- **UI label:** Peta sebaran (`MAP_COPY.title`)
- **Definisi:** Peta tematik di mana setiap region diwarnai sesuai nilai kategori ordinal (Rendah/Sedang/Tinggi). Untuk MVP dirender sebagai SVG hand-rolled dengan projector equirectangular (`src/lib/geo/projection.ts`); lihat ADR-0002.

### Ringkasan Nasional Peta

- **DB column:** —
- **TS variable:** `summary`, helper: `computeRegionalSummary(indicators)`
- **TS type:** `RegionalSummary` (`src/components/features/map/map-data.ts`)
- **UI label:** "Ringkasan Nasional" (kartu mengambang kiri-atas peta)
- **Definisi:** Agregat tahun aktif yang dihitung dari `region_indicators` yang sudah di-fetch halaman: rata-rata `y1_prevalence` (mengabaikan baris null), distribusi 3 kategori sebagai persentase + jumlah, dan total wilayah. Tidak ada use case khusus — dihitung in-process untuk hemat round-trip DB.

### Year Rail (Rel Tahun)

- **DB column:** —
- **TS variable:** komponen `VerticalYearRail`
- **TS type:** —
- **UI label:** "Tahun" (rel vertikal di pinggir kanan peta pada `lg+`, pill horizontal di mobile)
- **Definisi:** Pengganti slider untuk halaman `/map` saja. Render sebagai `role="radiogroup"`, mendukung ArrowUp/Down + Enter/Space. Tetap menulis param `?tahun=YYYY`. Komponen `YearSlider` lama (slider range) masih tersedia untuk konsumsi non-map bila diperlukan.

### Panduan Peta (Onboarding)

- **DB column:** —
- **TS variable:** `MAP_ONBOARDING_STEPS`, `ONBOARDING_STORAGE_KEY`
- **TS type:** `OnboardingStep` (`src/config/map.ts`)
- **UI label:** Modal "Panduan" + tombol "Buka panduan"
- **Definisi:** Modal 4 langkah yang muncul otomatis saat pertama kunjungi `/map` (tracked di `localStorage` key `peduli-stunting:map-onboarding-seen-v1`, versioned supaya bisa di-reset dengan bump suffix). Copy custom Peduli Stunting (BUKAN copy GeoPangan): introduksi peta, timeline tahun, klik detail, dan arti warna sesuai ambang WHO.

### Threshold Kategori Stunting (UI explainer)

- **DB column:** —
- **TS variable:** `STUNTING_CATEGORY_THRESHOLDS`
- **TS type:** Object konstanta
- **UI label:** Card "Apa itu kategori stunting?"
- **Definisi:** Ambang WHO public-health significance (Rendah `<20%`, Sedang `20%-29.9%`, Tinggi `≥30%`) yang ditampilkan sebagai panduan baca. **Bukan** sumber kategorisasi — `y_category` di DB diambil apa adanya dari kolom `Y` Dataset SSGI/SKI.
