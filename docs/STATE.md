# STATE.md — Peduli Stunting

Snapshot kanonik kondisi aplikasi. WAJIB dibaca oleh agen (manusia atau AI) sebelum
mengerjakan tugas apa pun di repo ini, dan WAJIB diperbarui di PR yang sama dengan
perubahan struktural.

- **Tanggal snapshot:** 2026-05-25
- **Tahap saat ini:** Stage 4 (iterasi per halaman) — halaman Landing & Auth selesai. Berikutnya: Map.
- **Aturan main lengkap:** lihat [project guidelines](../project guidelines). STATE.md TIDAK menggantikan project guidelines.

---

## 1. Ringkasan Produk

**Peduli Stunting** adalah web app Next.js + Supabase yang menyatukan empat fungsi:

1. **Map** — choropleth kab/kota Indonesia 2021-2024 untuk prevalensi & kategori stunting,
   dengan toggle prediksi model GTWENOLR.
2. **Edukasi** — perpustakaan artikel berbasis Buku KIA 2024, dikelompokkan per topik & rentang usia.
3. **Tracker** — pemantauan pertumbuhan anak personal (BB, TB/PB, LK, LiLA), z-score
   otomatis vs standar WHO, ceklis imunisasi & milestone perkembangan.
4. **Dashboard** — penjelasan model GTWENOLR, metrik, dan slider what-if prediktor.

Pengguna sasaran: orang tua / pengasuh / kader posyandu / mahasiswa kesehatan, di seluruh
Indonesia, termasuk ponsel Android mid-range di jaringan lambat (lihat budget di
project guidelines Section 7).

---

## 2. Arsitektur Empat Lapis (Clean Architecture + SOLID)

Mengikuti project guidelines Section 3. Dependensi mengalir ke dalam.

```
              ┌──────────────────────────────┐
              │       presentation           │  Next.js App Router, RSC,
              │  /src/app, /src/components   │  Server Actions, primitives
              └─────────────┬────────────────┘
                            │ memanggil use case via composition root
              ┌─────────────▼────────────────┐
              │       application            │  Use cases (1 method execute()),
              │       /src/application       │  DTO, orchestration
              └─────────────┬────────────────┘
                            │ bergantung pada interface saja
              ┌─────────────▼────────────────┐
              │           domain             │  Entity, Value Object,
              │         /src/domain          │  Domain Service, Port (interface),
              │                              │  Error Taxonomy, Result
              └─────────────▲────────────────┘
                            │ mengimplementasikan port
              ┌─────────────┴────────────────┐
              │      infrastructure          │  Supabase repos, WHO LMS calculator,
              │     /src/infrastructure      │  Sentry, Pino, Storage, geo-loader
              └──────────────────────────────┘
```

**Composition root** (`/src/composition/`) merangkai semua dependency injection. Tidak ada
container DI runtime — wiring eksplisit per use case factory.

### Bounded contexts (folder dalam tiap lapis)

| Context       | Tanggung jawab                                                             |
| ------------- | -------------------------------------------------------------------------- |
| `region`      | Region, batas wilayah, indikator per tahun, kamus prediktor                |
| `model`       | Metadata model GTWENOLR, prediksi, koefisien lokal                         |
| `education`   | Artikel edukasi, topik, rentang usia                                       |
| `tracking`    | Anak, pengukuran, standar WHO, z-score, klasifikasi                        |
| `health-plan` | Jadwal imunisasi, ceklis perkembangan, status anak                         |
| `account`     | Profil user, preferensi, sesi                                              |
| `shared`      | Result, AppError, branded primitives, value object umum (Tahun, Usia, dsb) |

---

## 3. Model Domain

### 3.1 Branded Primitives (di `domain/shared/`)

`UserId`, `RegionId`, `ChildId`, `MeasurementId`, `ArticleId`, `KodeBps`, `Year`,
`AgeMonths`, `Kilograms`, `Centimeters`, `Prevalence`, `ZScore`, `Probability`.

### 3.2 Value Objects

| VO                   | Domain    | Catatan invariant                                      |
| -------------------- | --------- | ------------------------------------------------------ | ------ | ------- |
| `Centroid`           | region    | lat ∈ [-90,90], lng ∈ [-180,180]                       |
| `RegionBoundary`     | region    | GeoJSON FeatureCollection / MultiPolygon               |
| `StuntingCategory`   | region    | enum `Rendah                                           | Sedang | Tinggi` |
| `PredictorCode`      | region    | literal `X1..X20`                                      |
| `ClassProbabilities` | model     | jumlah 1.0 ± 1e-6, semua ∈ [0,1]                       |
| `ModelMetrics`       | model     | accuracy ∈ [0,1], MAE ≥ 0, dst.                        |
| `Hyperparameters`    | model     | nilai positif (kecuali theta ∈ [0,1])                  |
| `AgeRangeMonths`     | education | min ≤ max, keduanya ≥ 0                                |
| `Sex`                | tracking  | enum `L                                                | P`     |
| `DateOnly`           | shared    | string `YYYY-MM-DD`, validasi Zod                      |
| `AgeMonths`          | shared    | integer ≥ 0, dihitung dari birthDate + measurementDate |
| `LmsParams`          | tracking  | `L`, `M > 0`, `S > 0`                                  |
| `ZScore`             | tracking  | finite number                                          |
| `SdClassification`   | tracking  | enum 5 kelas, lihat GLOSSARY                           |

### 3.3 Entity

| Entity              | Domain      | Identitas                                      |
| ------------------- | ----------- | ---------------------------------------------- |
| `Region`            | region      | `KodeBps`                                      |
| `RegionIndicators`  | region      | `(KodeBps, Year)`                              |
| `Predictor`         | region      | `PredictorCode`                                |
| `ModelMetadata`     | model       | `ModelVersion`                                 |
| `ModelPrediction`   | model       | `(KodeBps, Year, ModelVersion)`                |
| `LocalCoefficient`  | model       | `(KodeBps, Year, PredictorCode, ModelVersion)` |
| `EducationArticle`  | education   | `ArticleId`                                    |
| `Child`             | tracking    | `ChildId` (owner: `UserId`)                    |
| `GrowthMeasurement` | tracking    | `MeasurementId` (owner: `UserId`)              |
| `GrowthStandard`    | tracking    | `(indicator, sex, ageMonths)`                  |
| `Immunization`      | health-plan | `code` (mis. `HB0`, `BCG`)                     |
| `ChildImmunization` | health-plan | `(childId, immunizationCode)`                  |
| `Milestone`         | health-plan | `milestoneId`                                  |
| `ChildMilestone`    | health-plan | `(childId, milestoneId)`                       |
| `UserProfile`       | account     | `UserId`                                       |

### 3.4 Domain Services

- `ZScoreCalculator` (tracking) — implementasi metode WHO LMS, murni TS, tanpa IO.
- `SdClassifier` (tracking) — memetakan Z-score ke `SdClassification` per `GrowthIndicator`
  sesuai Permenkes No. 2 Tahun 2020 / Buku KIA 2024.
- `AgeMonthsCalculator` (shared) — selisih bulan penuh antara dua tanggal, deterministik.
- `StuntingCategoryMapper` (region) — bila perlu memetakan prevalensi ke kategori ordinal
  (sumber ground truth tetap kolom `Y` dari Dataset; mapper dipakai hanya untuk what-if).

### 3.5 Ports (interface di `domain/ports/`)

`RegionRepository`, `RegionIndicatorsRepository`, `RegionBoundaryRepository`,
`IndicatorDictionaryRepository`, `ModelMetadataRepository`, `ModelPredictionRepository`,
`LocalCoefficientRepository`, `EducationArticleRepository`, `ChildRepository`,
`GrowthMeasurementRepository`, `GrowthStandardRepository`, `ImmunizationRepository`,
`MilestoneRepository`, `UserProfileRepository`, `Clock`, `Logger`, `IdGenerator`.

---

## 4. Skema Database (Supabase / Postgres)

Konvensi global: `snake_case`, tabel jamak, `id uuid pk default gen_random_uuid()` kecuali
tabel referensi yang punya kunci natural, `created_at`/`updated_at` `timestamptz` dengan
trigger, foreign key dengan `on delete` eksplisit. RLS aktif pada SEMUA tabel.

> Legenda akses: **PUB-R** = readable oleh authenticated user, hanya tulis lewat admin /
> service role. **USR** = owner-only (RLS `auth.uid() = user_id`).

### 4.1 Tabel Publik (referensi & data peneliti)

#### `regions` — PUB-R

| Kolom                     | Tipe               | Catatan                                 |
| ------------------------- | ------------------ | --------------------------------------- |
| `kode_bps`                | `text` PK          | 4 karakter, contoh `1101`               |
| `provinsi`                | `text not null`    |                                         |
| `kabupaten_kota`          | `text not null`    | Penamaan resmi BPS                      |
| `tipe`                    | `text not null`    | `Kabupaten` / `Kota` (CHECK constraint) |
| `latitude`                | `double precision` | Centroid                                |
| `longitude`               | `double precision` | Centroid                                |
| `created_at`/`updated_at` | `timestamptz`      |                                         |

Indeks: `(provinsi)`, `(kabupaten_kota)`.

#### `region_boundaries` — PUB-R

| Kolom                      | Tipe                               | Catatan                                      |
| -------------------------- | ---------------------------------- | -------------------------------------------- |
| `kode_bps`                 | `text` PK FK -> `regions.kode_bps` |                                              |
| `geometry`                 | `jsonb`                            | GeoJSON tersederhanakan (mapshaper/topojson) |
| `simplification_tolerance` | `numeric`                          | Untuk audit, mis. 0.005                      |
| `source`                   | `text`                             | `indo_kabkota_2023.gpkg`                     |

> Catatan: `postgis` tetap opsional. Untuk MVP cukup `jsonb` GeoJSON karena query spasial
> dilakukan di client peta, bukan di DB. Jika nanti butuh filter spasial server-side,
> ADR baru akan mengaktifkan ekstensi PostGIS.

#### `indicator_dictionary` — PUB-R

| Kolom              | Tipe            | Catatan                           |
| ------------------ | --------------- | --------------------------------- |
| `code`             | `text` PK       | `Y`, `Y1`, `X1`..`X20`            |
| `dimension`        | `text not null` | CHECK terhadap enum di GLOSSARY   |
| `name`             | `text not null` | Nama lengkap                      |
| `description`      | `text`          | Keterangan tambahan               |
| `unit`             | `text`          | mis. `%`, `Rupiah/kapita/bulan`   |
| `source_label`     | `text`          | mis. `SSGI 2023`, `BPS`           |
| `source_url`       | `text`          |                                   |
| `effect_direction` | `text`          | `protective` / `risk` / `neutral` |

Seed dari sheet `Source` Dataset.xlsx (lewat script import, BUKAN hardcode).

#### `region_indicators` — PUB-R

| Kolom           | Tipe                   | Catatan                            |
| --------------- | ---------------------- | ---------------------------------- |
| `id`            | `uuid` PK              |                                    |
| `kode_bps`      | `text` FK -> `regions` |                                    |
| `tahun`         | `int2 not null`        | 2021..2024 (CHECK)                 |
| `y_category`    | `text not null`        | `Rendah`/`Sedang`/`Tinggi` (CHECK) |
| `y1_prevalence` | `numeric(5,2)`         | Persen 0..100                      |
| `x1`..`x20`     | `numeric`              | Nullable; data publik apa adanya   |

Unique `(kode_bps, tahun)`. Index `(tahun)`, `(kode_bps, tahun)`.

#### `model_metadata` — PUB-R

| Kolom             | Tipe            | Catatan                                          |
| ----------------- | --------------- | ------------------------------------------------ |
| `version`         | `text` PK       | mis. `gtwenolr-adaptive-1.0`                     |
| `name`            | `text not null` | "GTWENOLR (adaptive bandwidth)"                  |
| `hyperparameters` | `jsonb`         | `{hs, ht, lambda, theta}`                        |
| `metrics`         | `jsonb`         | `{accuracy, qwk, mae, log_score, in_sample,...}` |
| `moran_per_year`  | `jsonb`         | `{ "2021": 0.x, ... }`                           |
| `notes`           | `text`          | Catatan publikasi                                |
| `is_default`      | `boolean`       | Untuk pilih versi aktif tanpa hardcode           |

#### `model_predictions` — PUB-R

| Kolom                | Tipe                                  | Catatan                    |
| -------------------- | ------------------------------------- | -------------------------- |
| `id`                 | `uuid` PK                             |                            |
| `model_version`      | `text` FK -> `model_metadata.version` |                            |
| `kode_bps`           | `text` FK -> `regions`                |                            |
| `tahun`              | `int2 not null`                       |                            |
| `predicted_category` | `text not null`                       | `Rendah`/`Sedang`/`Tinggi` |
| `prob_rendah`        | `numeric(7,6)`                        |                            |
| `prob_sedang`        | `numeric(7,6)`                        |                            |
| `prob_tinggi`        | `numeric(7,6)`                        |                            |

Unique `(model_version, kode_bps, tahun)`.

#### `model_coefficients` — PUB-R (opsional, untuk what-if)

| Kolom            | Tipe                                     | Catatan                                 |
| ---------------- | ---------------------------------------- | --------------------------------------- |
| `id`             | `uuid` PK                                |                                         |
| `model_version`  | `text` FK                                |                                         |
| `kode_bps`       | `text` FK                                |                                         |
| `tahun`          | `int2`                                   |                                         |
| `predictor_code` | `text` FK -> `indicator_dictionary.code` |                                         |
| `coefficient`    | `numeric`                                |                                         |
| `se`             | `numeric`                                | Standard error (untuk inferensi GTWOLR) |
| `is_inference`   | `boolean`                                | `true` jika dari model non-penalti      |

Unique `(model_version, kode_bps, tahun, predictor_code)`.

#### `growth_standards` — PUB-R

| Kolom        | Tipe               | Catatan                                           |
| ------------ | ------------------ | ------------------------------------------------- |
| `indicator`  | `text not null`    | `BB_U` / `TB_U` / `BB_TB` / `LK_U` (CHECK)        |
| `sex`        | `text not null`    | `L` / `P`                                         |
| `age_months` | `int2 not null`    | Untuk `BB_TB` interpretasi berbeda; lihat catatan |
| `x_value`    | `numeric`          | Hanya untuk `BB_TB` (TB sebagai sumbu X)          |
| `l`          | `numeric not null` |                                                   |
| `m`          | `numeric not null` |                                                   |
| `s`          | `numeric not null` |                                                   |

Komposit PK `(indicator, sex, age_months, coalesce(x_value, 0))`. Sumber: WHO LMS.

#### `education_articles` — PUB-R

| Kolom            | Tipe            | Catatan                                        |
| ---------------- | --------------- | ---------------------------------------------- |
| `id`             | `uuid` PK       |                                                |
| `slug`           | `text unique`   |                                                |
| `title`          | `text not null` |                                                |
| `topic`          | `text not null` | enum GLOSSARY                                  |
| `min_age_months` | `int2`          | Nullable untuk topik non-usia (mis. kehamilan) |
| `max_age_months` | `int2`          |                                                |
| `summary`        | `text`          |                                                |
| `body_md`        | `text`          | Markdown sanitized                             |
| `source_label`   | `text`          | `Buku KIA 2024 hal. NN`                        |
| `source_url`     | `text`          |                                                |
| `published_at`   | `timestamptz`   |                                                |

#### `immunization_schedule` — PUB-R

| Kolom                    | Tipe            | Catatan                   |
| ------------------------ | --------------- | ------------------------- |
| `code`                   | `text` PK       | mis. `HB0`, `BCG`, `DPT1` |
| `name`                   | `text not null` |                           |
| `dose_number`            | `int2`          |                           |
| `recommended_age_months` | `int2`          | Usia rekomendasi          |
| `notes`                  | `text`          |                           |

#### `milestones` — PUB-R

| Kolom            | Tipe            | Catatan                                              |
| ---------------- | --------------- | ---------------------------------------------------- |
| `id`             | `uuid` PK       |                                                      |
| `code`           | `text unique`   | Slug stabil                                          |
| `domain`         | `text not null` | `gross_motor` / `fine_motor` / `language` / `social` |
| `min_age_months` | `int2 not null` |                                                      |
| `max_age_months` | `int2 not null` |                                                      |
| `description`    | `text not null` |                                                      |
| `source_label`   | `text`          |                                                      |

### 4.2 Tabel User-Owned (RLS owner-only)

#### `profiles` — USR (1:1 dengan `auth.users`)

| Kolom              | Tipe                            | Catatan                                       |
| ------------------ | ------------------------------- | --------------------------------------------- |
| `user_id`          | `uuid` PK FK -> `auth.users.id` |                                               |
| `display_name`     | `text`                          |                                               |
| `role`             | `text not null`                 | `user` / `admin` (CHECK), default `user`      |
| `theme_preference` | `text not null`                 | `system` / `light` / `dark`, default `system` |
| `locale`           | `text not null`                 | default `id-ID`                               |

Trigger: insert otomatis saat user baru terdaftar. Role admin diberikan manual
lewat SQL dashboard / migration, tidak via UI.

#### `children` — USR

| Kolom                   | Tipe                                   | Catatan                                    |
| ----------------------- | -------------------------------------- | ------------------------------------------ |
| `id`                    | `uuid` PK                              |                                            |
| `user_id`               | `uuid` FK -> `auth.users.id` (cascade) |                                            |
| `name`                  | `text not null`                        | Disarankan nama panggilan, bukan PII penuh |
| `sex`                   | `text not null`                        | `L`/`P`                                    |
| `birth_date`            | `date not null`                        |                                            |
| `birth_weight_kg`       | `numeric`                              |                                            |
| `birth_length_cm`       | `numeric`                              |                                            |
| `gestational_age_weeks` | `int2`                                 |                                            |
| `notes`                 | `text`                                 |                                            |
| `deleted_at`            | `timestamptz`                          | Soft delete                                |

#### `growth_measurements` — USR

| Kolom                   | Tipe                                 | Catatan                                     |
| ----------------------- | ------------------------------------ | ------------------------------------------- |
| `id`                    | `uuid` PK                            |                                             |
| `user_id`               | `uuid` FK                            | Redundan untuk RLS                          |
| `child_id`              | `uuid` FK -> `children.id` (cascade) |                                             |
| `measured_at`           | `date not null`                      |                                             |
| `weight_kg`             | `numeric`                            |                                             |
| `height_cm`             | `numeric`                            |                                             |
| `measured_lying`        | `boolean`                            | `true` saat PB (telentang), `false` saat TB |
| `head_circumference_cm` | `numeric`                            |                                             |
| `muac_cm`               | `numeric`                            |                                             |
| `z_scores`              | `jsonb`                              | `{ bbU, tbU, bbTb, lkU }` setelah dihitung  |
| `sd_class`              | `jsonb`                              | Klasifikasi per indikator                   |
| `note`                  | `text`                               |                                             |

Unique `(child_id, measured_at)`. Z-score dihitung di domain saat insert/update lewat use case.

#### `child_immunizations` — USR

| Kolom               | Tipe                                      | Catatan                        |
| ------------------- | ----------------------------------------- | ------------------------------ |
| `id`                | `uuid` PK                                 |                                |
| `user_id`           | `uuid` FK                                 |                                |
| `child_id`          | `uuid` FK -> `children.id`                |                                |
| `immunization_code` | `text` FK -> `immunization_schedule.code` |                                |
| `status`            | `text not null`                           | `pending` / `done` / `skipped` |
| `given_at`          | `date`                                    |                                |
| `note`              | `text`                                    |                                |

Unique `(child_id, immunization_code)`.

#### `child_milestones` — USR

| Kolom          | Tipe                         | Catatan                                |
| -------------- | ---------------------------- | -------------------------------------- |
| `id`           | `uuid` PK                    |                                        |
| `user_id`      | `uuid` FK                    |                                        |
| `child_id`     | `uuid` FK                    |                                        |
| `milestone_id` | `uuid` FK -> `milestones.id` |                                        |
| `status`       | `text not null`              | `not_checked` / `achieved` / `delayed` |
| `checked_at`   | `date`                       |                                        |
| `note`         | `text`                       |                                        |

Unique `(child_id, milestone_id)`.

### 4.3 Catatan RLS

- PUB-R: policy `for select using (auth.role() = 'authenticated')`. Tidak ada policy
  INSERT/UPDATE/DELETE untuk user; mutasi hanya lewat service role di script import.
- USR: policy `for all using (auth.uid() = user_id) with check (auth.uid() = user_id)`.
- `pgtap` test untuk tiap tabel di `/supabase/tests/`.

### 4.4 Tabel TIDAK ditangani di MVP

- Komentar/ulasan, sharing antar user, role admin granular, audit log. Bila dibutuhkan,
  tambah lewat ADR baru.

---

## 5. Peta Route dan Strategi Caching

Mengikuti project guidelines Section 13 (caching multi-layer). Setiap route mencatat:
**Mode** = `static` | `ISR(s)` | `dynamic`; **Tags** konsumsi; **Mutators** = use case
yang akan `revalidateTag` setelah selesai.

### 5.1 Publik (tanpa auth)

| Path                    | Mode      | Tags konsumsi | Catatan                                                                                                                                     |
| ----------------------- | --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | `static`  | —             | Landing: hero, value props, CTA Register/Login. Konten statik dari config (tanpa fetch DB).                                                 |
| `/auth/sign-in`         | `dynamic` | —             | Form Supabase Auth (email/password + Google). Tampilkan `?error=` ramah lewat `getAuthErrorMessage`.                                        |
| `/auth/sign-up`         | `dynamic` | —             | Form sign-up + verifikasi email. Membawa `redirect` melalui `emailRedirectTo` callback.                                                     |
| `/auth/callback`        | `dynamic` | —             | OAuth/recovery callback handler (Supabase). Recovery (`next=/auth/update-password`) yang gagal → `/auth/sign-in?error=reset_token_invalid`. |
| `/auth/reset-password`  | `dynamic` | —             | Permintaan reset password. Selalu sukses (anti-enumerasi) kecuali rate-limit.                                                               |
| `/auth/update-password` | `dynamic` | —             | Set kata sandi baru setelah callback recovery. Diizinkan untuk sesi aktif (lihat `shouldRedirectAuthenticatedAway`).                        |

### 5.2 Terproteksi (`(app)` route group dengan middleware auth)

| Path                                   | Mode         | Tags konsumsi                                                                                                                                                                                                   | Catatan                                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `/map`                                 | `dynamic`    | `regions`, `region-boundaries`, `region-indicators:{tahun}`, `model-predictions:{version}:{tahun}`, opsional saat ada selection: `region-indicators-history:{kodeBps}`, `model-predictions:{version}:{kodeBps}` | Default landing setelah login. URL search params: `tahun`, `sumber=actual                                                                                                                                                                                                                  | predicted`, `wilayah=<kodeBps>`. Selection ada di query (`?wilayah=`), tidak di route dinamis. |
| `/edukasi`                             | `ISR(1800)`  | `articles`                                                                                                                                                                                                      | List artikel; filter topik & usia via search params.                                                                                                                                                                                                                                       |
| `/edukasi/[slug]`                      | `ISR(86400)` | `article:{slug}`                                                                                                                                                                                                | Detail artikel.                                                                                                                                                                                                                                                                            |
| `/tracker`                             | `dynamic`    | `user:{userId}:children`                                                                                                                                                                                        | List anak milik user.                                                                                                                                                                                                                                                                      |
| `/tracker/anak/baru`                   | `dynamic`    | —                                                                                                                                                                                                               | Form tambah anak.                                                                                                                                                                                                                                                                          |
| `/tracker/anak/[childId]`              | `dynamic`    | `child:{childId}`, `child:{childId}:measurements`                                                                                                                                                               | Detail anak: grafik z-score, ringkasan.                                                                                                                                                                                                                                                    |
| `/tracker/anak/[childId]/pengukuran`   | `dynamic`    | `child:{childId}:measurements`                                                                                                                                                                                  | List pengukuran + form tambah.                                                                                                                                                                                                                                                             |
| `/tracker/anak/[childId]/imunisasi`    | `dynamic`    | `immunization-schedule`, `child:{childId}:immunizations`                                                                                                                                                        | Ceklis imunisasi anak.                                                                                                                                                                                                                                                                     |
| `/tracker/anak/[childId]/perkembangan` | `dynamic`    | `milestones`, `child:{childId}:milestones`                                                                                                                                                                      | Ceklis SDIDTK.                                                                                                                                                                                                                                                                             |
| `/dashboard`                           | `dynamic`    | `model-metadata`, `model-coefficients:{version}`, `indicator-dictionary`                                                                                                                                        | Stage 4 monolit: snapshot metrik final, perbandingan 6 model, Moran's I per tahun, kamus prediktor, kontribusi protektif/risiko, dan what-if slider. Empty state instruksional bila `model_coefficients` belum di-seed. `dynamic` karena Supabase client terikat cookie sesi (lihat §10f). |
| `/dashboard/variabel/[code]`           | `ISR(86400)` | `indicator:{code}`, `region-indicators:{code}`                                                                                                                                                                  | (Belum dibangun) Profil prediktor + peta variabel.                                                                                                                                                                                                                                         |
| `/account`                             | `dynamic`    | `user:{userId}:profile`                                                                                                                                                                                         | Profil & logout.                                                                                                                                                                                                                                                                           |

### 5.3 Server Action utama (mutator + tag revalidation)

| Action                           | Bounded context | Tag yang di-revalidate                            |
| -------------------------------- | --------------- | ------------------------------------------------- |
| `createChild`                    | tracking        | `user:{userId}:children`                          |
| `updateChild`, `softDeleteChild` | tracking        | `user:{userId}:children`, `child:{childId}`       |
| `addMeasurement`                 | tracking        | `child:{childId}:measurements`, `child:{childId}` |
| `updateImmunizationStatus`       | health-plan     | `child:{childId}:immunizations`                   |
| `updateMilestoneStatus`          | health-plan     | `child:{childId}:milestones`                      |
| `updateUserProfile`              | account         | `user:{userId}:profile`                           |

### 5.4 Konvensi caching tambahan

- Tahun aktif map = URL search param (`?tahun=2024`). Default ke `tahun` terbaru dari
  `@/config/years` (mirror dataset import).
- GeoJSON batas wilayah di-fetch sekali per request via use case
  `listRegionBoundaries` (tag `region-boundaries`); render terjadi server-side
  sebagai `<svg>` HTML (lihat ADR-0002), tanpa library peta runtime.
- Tidak ada client-side data fetch saat RSC bisa menyajikan props. `<MapPaths>`
  adalah Server Component yang mengubah GeoJSON menjadi `<a><path/></a>`; klien
  hanya menerima HTML, plus shell `<MapViewer>` tipis untuk event delegation
  navigasi.

---

## 6. Sumber Data & Skrip Import

Semua data dimuat lewat skrip import (`pnpm ts-node scripts/import-*.ts`) yang membaca
file di `docs/source/` lokal. File sumber TIDAK di-commit (lihat `.gitignore`).

| Skrip                          | Sumber                                                                                                            | Tujuan                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `scripts/import-regions.ts`    | `lookup_kabkota_shapefile.csv` + sheet `Dataset` (Kode_BPS, Provinsi, Kabupaten_Kota, Tipe, Lat/Long)             | `regions`                                                        |
| `scripts/import-boundaries.ts` | `indo_kabkota_2023.gpkg` (disederhanakan)                                                                         | `region_boundaries`                                              |
| `scripts/import-indicators.ts` | sheet `Dataset` + sheet `Source`                                                                                  | `region_indicators`, `indicator_dictionary`                      |
| `scripts/import-model.ts`      | `docs/source/model-exports/model_metadata.{csv,json}`, `model_predictions.csv`, opsional `model_coefficients.csv` | `model_metadata`, `model_predictions`, `model_coefficients`      |
| `scripts/import-who.ts`        | `docs/source/who-standards/*.csv`                                                                                 | `growth_standards`                                               |
| `scripts/import-kia-stubs.ts`  | `buku-kia-2024.pdf` (manual ekstrak heading + halaman)                                                            | Stub `education_articles`, `immunization_schedule`, `milestones` |

> Dataset punya 540 kab/kota; model di Bab4 memakai 514 (panel tidak seimbang). Skrip
> import menyimpan keduanya apa adanya. Region tanpa prediksi model dibiarkan kosong di
> `model_predictions` (UI menampilkan empty state, bukan placeholder palsu).

---

## 7. Dependency yang Akan Dipasang (Stage 1)

Mengikuti project guidelines Section 1 (locked stack). Versi mengikuti latest stable saat
scaffolding; pinning eksplisit di `package.json`.

### 7.1 Runtime — produksi

- `next` (App Router, latest stable)
- `react`, `react-dom`
- `typescript` (strict)
- `@supabase/supabase-js`, `@supabase/ssr` (client browser & server, cookie-based session)
- `zod`
- `react-hook-form`, `@hookform/resolvers`
- `class-variance-authority`, `clsx`, `tailwind-merge` (utility variants)
- `tailwindcss`, `postcss`, `autoprefixer`
- `@tailwindcss/typography` (untuk artikel edukasi markdown)
- `sonner` (toast)
- `lucide-react` (icon set)
- `pino`, `pino-pretty` (dev)
- `@sentry/nextjs`
- `dompurify`, `isomorphic-dompurify` (sanitize rich text)
- `date-fns`, `date-fns-tz` (manipulasi tanggal/usia)
- ~~`maplibre-gl` + `react-map-gl/maplibre`~~ — tidak dipasang (lihat ADR-0002). Peta dirender sebagai SVG choropleth server-side dengan projector equirectangular hand-rolled di `src/lib/geo/projection.ts` (~0 KB tambahan client JS).
- `@upstash/ratelimit`, `@upstash/redis` (rate limit auth/write — opsional, aktifkan saat go-live)
- `marked` atau `react-markdown` + `remark-gfm` (render artikel) — keputusan final saat halaman Edukasi
- `recharts` ATAU `visx` (kurva pertumbuhan; keputusan final saat halaman Tracker; pilih yang lebih ringan)

### 7.2 Dev / tooling

- `eslint`, `eslint-config-next`, `@typescript-eslint/*`
- `prettier`, `prettier-plugin-tailwindcss`
- `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- `jsdom` atau `happy-dom`
- `@playwright/test`
- `axe-playwright`
- `husky`, `lint-staged`
- `@commitlint/cli`, `@commitlint/config-conventional`
- `tsx` (runner script import)
- `@next/bundle-analyzer`
- `lighthouse-ci` (CI)
- `supabase` CLI (devDependency / external)
- `pgtap` (DB tests, via Supabase CLI)

### 7.3 Library script import (lokal, devDependency)

- `xlsx` atau `exceljs` (baca Dataset.xlsx)
- `mapshaper` (simplifikasi geometri; bisa CLI eksternal alih-alih library)
- `papaparse` (CSV)
- `@types/geojson`

> Dependency baru di luar daftar ini WAJIB lewat ADR.

---

## 8. Komponen Primitive yang Akan Dibangun

Sumber tunggal di `/src/components/primitives/`. Setiap primitive: variant via `cva`,
TSDoc `@example` per varian/state, test komponen.

`Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Radio`,
`Switch`, `Slider`, `Tabs`, `Card`, `Sheet`, `Modal`, `Drawer`, `Popover`, `Tooltip`,
`Toast` (wrapper Sonner), `Skeleton`, `ErrorState`, `EmptyState`, `Spinner` (internal-only),
`Avatar`, `Badge`, `Chip`, `DataTable` (minimal, virtualized untuk list panjang),
`Legend` (untuk peta), `StatTile` (untuk dashboard), `ZScoreChart` (wrapper grafik
tracker — domain-aware tapi tetap presentational).

---

## 9. Design Token (Stage 1)

Sumber tunggal: `tailwind.config.ts` + `:root` CSS variables.

- **Brand palette:** `off-white`, `off-black`, `primary #095f96`, `primary-light #4aa5df`,
  `accent-green #6fbe8d`.
- **Ordinal map palette** (terpisah dari brand, agar bisa di-redefine tanpa ganggu UI):
  `ordinal-rendah` (hijau), `ordinal-sedang` (kuning), `ordinal-tinggi` (merah).
  Cut-off WCAG AA dipastikan kontras dengan teks.
- **Typography:** scale tetap (font-size, line-height); heading fluida via `clamp()`.
- **Spacing/Radius/Shadow/Z-index:** skala terkunci.
- **Theming:** `data-theme="dark"` toggle pada `<html>`; preferensi disimpan di
  `profiles.theme_preference`.

Logo dari `public/brand/`: `logo-horizontal-color.png` (header light),
`logo-horizontal-white.png` (header dark), `icon-color.png` (favicon).

---

## 10. Status Stage

| Stage                         | Status      | Catatan                                                                                                                                                                                                |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stage 0 — Orientasi & rencana | **selesai** | STATE.md, GLOSSARY.md, ADR-0001 dibuat. `.gitignore` dibuat.                                                                                                                                           |
| Stage 1 — Scaffold proyek     | **selesai** | Lihat §10a di bawah.                                                                                                                                                                                   |
| Stage 2 — Backend fondasi     | **selesai** | 16 repository Supabase + 23 use case terpasang via composition root per-request; 90 test hijau.                                                                                                        |
| Stage 3 — Frontend kerangka   | **selesai** | Lihat §10b di bawah.                                                                                                                                                                                   |
| Stage 4 — Iterasi per halaman | berjalan    | Halaman selesai: **Landing** (§10c), **Auth** (§10d), **Account** (§10e), **Peta** (§10f), **Dashboard** (§10f bawah), **Edukasi** (§10g), **Tracker** (§10h). Berikutnya: penyempurnaan + admin path. |

### 10a. Hasil Stage 1 — Scaffold (2026-05-25)

Toolchain & gerbang lokal terpasang dan **semua hijau** (`pnpm lint`, `pnpm typecheck`,
`pnpm test`, `pnpm build`).

**Deliverable utama:**

- `package.json` (pnpm 11, Node ≥22, scripts: dev/build/lint/format/typecheck/test/test:e2e).
- `tsconfig.json` — strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + path alias `@/*`.
- `next.config.ts` — `typedRoutes`, AVIF/WebP, security headers (CSP nonce ditangguhkan ke Stage 3 saat layout siap).
- `tailwind.config.ts` + `src/styles/globals.css` — token brand (off-white, off-black, `#095f96`, `#4aa5df`, `#6fbe8d`), skala ordinal Rendah/Sedang/Tinggi, light/dark via CSS variables, fluid typography via `clamp()`.
- `eslint.config.mjs` (flat, ESLint 9) — `next/core-web-vitals` + `next/typescript`, larangan `process.env` di luar `src/config/env.ts`, larangan `console` di `src/app/**` & `src/components/**`.
- `vitest.config.ts` (happy-dom + threshold 80%) dan `playwright.config.ts` (Chromium desktop + Pixel 5 mobile).
- `commitlint.config.js` + `.lintstagedrc.json` + Husky `pre-commit` (`lint-staged` + `typecheck`) & `commit-msg`.
- Sentry: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts` (re-export `captureRequestError as onRequestError`).
- `src/config/env.ts` — Zod validation tunggal untuk semua env (Supabase & Sentry opsional di Stage 1).
- `src/config/{app,years}.ts` — konstanta `APP_NAME`, `DEFAULT_AUTHENTICATED_ROUTE="/map"`, `SUPPORTED_YEARS`.
- Domain shared: `Result<T,E>` + helper (`ok/err/map/flatMap/fromPromise`), `Clock`, `Logger` port, `Brand<T,B>`.
- `src/domain/errors/app-error.ts` — taksonomi 8 kind + factory `AppErrors` + `appErrorToHttpStatus` (uji unit lengkap).
- Infrastructure: `PinoLoggerAdapter` (PII redaction), `createSupabaseServerClient`, `createSupabaseAdminClient`, `getSupabaseBrowserClient`, `updateSupabaseSession`.
- `src/proxy.ts` (Next 16: `middleware` → `proxy`) — delegasi ke `updateSupabaseSession` dengan matcher yang melewati aset statis & folder `brand/`.
- `src/composition/index.ts` — `AppContainer { clock, logger }` lewat `getContainer()` (scaffold; factory use case datang di Stage 2).
- `src/app/layout.tsx` + `src/app/page.tsx` + `src/app/not-found.tsx` + `src/app/health/route.ts` (build SHA via `env.VERCEL_GIT_COMMIT_SHA`).
- Tes: 24/24 hijau (Result + AppError + HTTP status mapper).

**Catatan perubahan dari rencana awal:**

- ESLint diturunkan ke v9 karena `eslint-plugin-react@7.x` (transitif dari `eslint-config-next`) belum kompatibel dengan ESLint v10.
- `tsconfig.compilerOptions.baseUrl` dilepas (deprecated di TS 6); `paths` tetap berfungsi karena bundler resolution.
- `next lint` (deprecated di Next 16) diganti `eslint .` langsung di script `lint`/`lint:fix`.
- File konvensi `middleware.ts` digantikan `proxy.ts` (penamaan baru Next 16).
- Build pertama membuat Next.js menambah `jsx: "react-jsx"` & `.next/dev/types/**/*.ts` ke `tsconfig.json` secara otomatis — dibiarkan sesuai standar Next.

**Yang sengaja DITUNDA (bukan kelalaian):**

- CSP nonce: butuh layout `<Script nonce>` yang baru muncul di Stage 3.
- Generated types Supabase (`src/types/supabase.ts`): muncul setelah migrasi pertama di Stage 2 (sesuai Migration Sequence Protocol).
- Composition root yang produktif (use case factories): Stage 2 saat use case pertama lahir.
- `next/font` & ikon brand di `<head>` lengkap: digabung saat membangun shell layout di Stage 3.

---

### 10b. Hasil Stage 3 — Frontend kerangka (2026-05-25)

Skeleton aplikasi end-to-end terpasang. Gerbang lokal hijau: `pnpm lint` (0 warning), `pnpm typecheck`, `pnpm test` (90/90), `pnpm build` (Next 16 turbopack, 10 route + middleware).

**Deliverable utama:**

- **Theme provider**: `src/components/theme/{theme-provider,theme-script,theme-toggle}.tsx` + `src/config/theme.ts`. Tiga opsi (`system`/`light`/`dark`) dipersist di `localStorage`, sinkron ke `<html data-theme>` lewat inline `ThemeScript` (no-flash). Memantau `prefers-color-scheme` via `matchMedia`. Toggle ikon-only (44px touch target) di header & landing.
- **Library primitif** (`src/components/primitives/`): `Button` (cva varian primary/secondary/ghost/outline/danger/link + sizes sm/md/lg/icon, helper `buttonVariants` untuk `<Link>`), `Input`/`Textarea`/`Select` (cva, `hint`/`errorMessage` dengan `aria-describedby` otomatis), `Label` (asterisk wajib), `Card` + Header/Title/Description/Content/Footer, `Modal` native `<dialog>` adaptif sheet→centered, `Spinner`, `Skeleton`, `ErrorState`, `EmptyState`, `Badge` (termasuk tone `rendah`/`sedang`/`tinggi`), `PageHeader`. Barrel: `src/components/primitives/index.ts`. Semua mencantumkan TSDoc `@example`.
- **Floating header** (`src/components/navigation/floating-header.tsx`): glassy floating bar (Peta, Dashboard, Edukasi, Tracker, Akun) + `ThemeToggle` + nama pengguna. Inline pada `md+`, collapse jadi panel slide-down di mobile dengan `aria-expanded`. Hanya dirender di route group `(app)`.
- **Auth gating** (`src/proxy.ts` + `src/config/routes.ts`): `updateSupabaseSession` kini mengembalikan `{ response, user }`. Proxy mengalihkan unauthenticated → `/auth/sign-in?redirect=…`, authenticated yang mencoba `/auth/*` → `/map`. Helper `isPublicRoute`/`isAuthRoute` mengonsumsi `PUBLIC_ROUTES`.
- **Route group `(auth)`**:
  - `layout.tsx` — split-screen (hero gradient brand di `lg+`, form di kanan).
  - `sign-in/page.tsx` + `sign-in-form.tsx` (Client, `useActionState`) — email + password + tombol Google OAuth (Server Action `signInWithGoogle` selalu redirect).
  - `sign-up/page.tsx` + `sign-up-form.tsx` — daftar email + password + konfirmasi + nama tampilan; pesan sukses bila Supabase mengirim email verifikasi.
  - `callback/route.ts` — `exchangeCodeForSession` untuk OAuth + magic link, redirect kembali ke `next` atau default route.
  - `actions.ts` — `signInWithPassword`, `signUpWithPassword`, `signInWithGoogle`, `signOut`; Zod via `src/schemas/auth.ts`, map error ke `AuthActionResult { ok, message, fieldErrors, redirectTo }`.
- **Route group `(app)`**:
  - `layout.tsx` — `requireServerSession` (helper baru di `src/lib/server-session.ts`), memuat `getCurrentProfile` lewat `makeUseCases(client)`, render `FloatingHeader` + container dengan padding header.
  - `/map` — `Promise.all([listRegions, listIndicatorDictionary])`; tabel 10 sampel wilayah + daftar indikator, lengkap dengan loading/error/empty states.
  - `/dashboard` — `getDefaultModelMetadata` + `listModelMetadata`; menampilkan hyperparameter, metrik, badge default vs arsip.
  - `/edukasi` — `listArticles`; grid kartu dengan badge topik & rentang usia.
  - `/tracker` — `requireServerSession` → `listChildrenByOwner(userId)`; kartu anak + CTA tambah (disabled, fitur Stage 4).
  - `/account` — `getCurrentProfile`; menampilkan nama, role, locale, tema, dan form `signOut`. Empty state khusus jika `NotFoundError` ("Profil belum lengkap").
- **Landing `/`** — hero + dua CTA (`Daftar gratis`, `Saya sudah punya akun`), grid 4 fitur, CTA banner, footer, `ThemeToggle`. Tetap publik tanpa header app.
- **Konfigurasi**:
  - `src/config/navigation.ts` — `PRIMARY_NAV` (Peta, Dashboard, Edukasi, Tracker, Akun), satu-satunya sumber kebenaran urutan menu.
  - `src/config/routes.ts` — `SIGN_IN_ROUTE`, `AUTH_ROUTE_PREFIX`, `isPublicRoute`, `isAuthRoute`.
  - `src/schemas/auth.ts` — `SignInSchema`, `SignUpSchema`.
  - `src/config/env.ts` — `emptyToUndefined` agar variabel opsional yang berisi string kosong (mis. Sentry placeholder di `.env.local`) tidak menggagalkan boot.

**Perubahan pada layer di luar presentation:**

- `src/infrastructure/supabase/middleware-client.ts` — return type sekarang `SessionContext { response, user }`.
- Primitive `Input`/`Textarea`/`Select` mengeksplisitkan `string | undefined` pada `hint`/`errorMessage` agar kompatibel dengan `exactOptionalPropertyTypes: true` saat dipakai dari Client Components.
- `ThemeProvider` direstrukturisasi (lazy `useState` initializer + `matchMedia` subscription) untuk memenuhi rule React 19 `react-hooks/set-state-in-effect`.

**Yang sengaja DITUNDA ke Stage 4:**

- Peta interaktif berbasis MapLibre (sekarang hanya tabel & daftar indikator).
- Halaman detail `/tracker/[childId]`, form tambah anak, form input pengukuran (sudah ada use case `createChild` & `addMeasurement` siap pakai).
- Halaman edit profil & sinkronisasi `theme_preference` dari DB.
- Halaman artikel detail `/edukasi/[slug]` (use case `getArticleBySlug` sudah tersedia).
- Halaman what-if dashboard, prediksi per tahun, dan visualisasi probabilitas.
- Sonner/Toast primitif (belum diperlukan oleh skeleton).
- CSP nonce (akan dipasang saat layout siap untuk script pihak ketiga).

**Catatan verifikasi visual:**
Verifikasi responsif di 360/768/1440 dengan throttling Slow 3G + Low-end CPU belum dilakukan secara manual oleh agen (tidak ada akses browser yang dapat dioperasikan). Wajib divalidasi manual di sesi berikut sebelum dianggap memenuhi Definition of Done §24.

---

### 10c. Hasil Stage 4 — Halaman Landing (2026-05-25)

Landing publik `/` dibawa ke kualitas produksi sesuai project guidelines §9 (responsif desktop-primary), §10 (token & primitives), §20 (a11y WCAG AA), dan §22 (anti-pattern: tanpa hardcode copy).

**Deliverable:**

- `src/config/landing.ts` — sumber tunggal seluruh marketing copy: `LANDING_LOGO` (varian light/dark), `LANDING_HERO`, `LANDING_MODEL_SNAPSHOT` (GTWENOLR), `LANDING_PILLARS` (4 pilar: Peta, Edukasi, Tracker, Dashboard), `LANDING_TRUST_POINTS`, `LANDING_CTA_BANNER`, `LANDING_FOOTER`. Sesuai keputusan §5.1 (Landing = `static`, tanpa fetch DB).
- `src/app/page.tsx` — komposisi RSC tanpa "use client": skip-link, sticky header dengan logo brand (`next/image`, priority, varian `dark:` ditukar via Tailwind), hero dua kolom dengan kartu snapshot model di `lg+`, grid pilar 1/2/4 kolom (`sm:grid-cols-2 lg:grid-cols-4`), trust strip, CTA banner gradient brand, footer. Palette hanya memakai token (`primary #095f96`, `primary-soft #4aa5df`, `accent #6fbe8d`, `off-white #fafaf8`, `off-black #181a1c`).
- `src/config/landing.test.ts` — 9 tes unit Vitest mengunci kontrak struktural konfigurasi (jumlah pilar, kunci & tone valid, CTA mengarah ke `/auth/sign-up` & `/auth/sign-in`, locale Indonesia).
- `tests/e2e/smoke.spec.ts` — diperluas menjadi suite Landing: hero + heading semua pilar, navigasi CTA primer/sekunder, dan sweep tanpa horizontal overflow di 360/768/1440 px (otomatis dijalankan pada projects `chromium-desktop` & `mobile-android-midrange`).

**A11y & responsif:**

- Skip-link `Lewati ke konten utama` mengarah ke `#main`.
- Hierarki heading: `h1` hero → `h2` per section (`pillars-title`, `trust-title`, `cta-title`) → `h3` per kartu pilar, semua dengan `aria-labelledby`/`aria-label`.
- Semua link interaktif menggunakan `buttonVariants` (target sentuh ≥44px pada `size="lg"`).
- Logo brand: dua `<Image>` (light/dark) yang ditukar via class `dark:` agar swap tema instan dan kompatibel dengan `data-theme="dark"` (Tailwind `darkMode: ["class", '[data-theme="dark"]']`).
- Decorative gradients menggunakan `aria-hidden`, tidak menambah noise ke screen reader.

**Verifikasi yang masih harus dilakukan manual sebelum DoD §24:**

- Lighthouse mobile (Slow 3G + Low-end CPU) untuk LCP, INP, CLS, dan ukuran bundle pada `/`.
- Uji visual di perangkat Android mid-range (Vivo Y17 class) atau emulasi setara di Chrome DevTools.
- axe-core scan pada preview deployment (akan menjadi bagian gerbang CI bersama).

**Yang sengaja TIDAK dibangun (tetap selaras dengan §5.1 & §12.4):**

- Tidak ada use case baru, port baru, atau migrasi RLS. Landing tidak menyentuh DB; tabel publik tetap read-only `authenticated` sesuai §4.3 & §12.10. Bila kelak ingin menampilkan statistik live (mis. jumlah artikel terbit) di Landing, perubahan kebijakan RLS publik harus melalui ADR baru.

### 10d. Hasil Stage 4 — Halaman Auth (2026-05-25)

Sub-tree `/auth/*` dibawa ke kualitas produksi: backend Supabase Auth penuh (email/password + Google + recovery), pesan error ramah dalam Bahasa Indonesia, semua state (loading/error/success), dan sweep responsif 360/768/1440 px tanpa horizontal overflow.

**Deliverable struktural:**

- `src/config/auth.ts` — sumber tunggal copy + asset brand panel: `AUTH_BRAND_PANEL` (`/brand/logo-stacked-white.png`), `SIGN_IN_COPY`, `SIGN_UP_COPY`, `RESET_PASSWORD_COPY`, `UPDATE_PASSWORD_COPY`, `AUTH_LABELS` (submit, separator, placeholder, show/hide, dst.), `AUTH_SUCCESS_MESSAGES` (verifikasi email, tautan reset, password tersimpan), `AUTH_ERROR_MESSAGES` (`google`, `callback_failed`, `session_expired`, `reset_token_invalid`) + `getAuthErrorMessage(code)` helper.
- `src/schemas/auth.ts` — di-faktor: `emailSchema`, `passwordSchema`, konstanta `PASSWORD_MIN_LENGTH=8`/`PASSWORD_MAX_LENGTH=72` (cocok dengan plafon bcrypt Supabase), `DISPLAY_NAME_MIN/MAX_LENGTH`. Schemas baru: `RequestPasswordResetSchema`, `UpdatePasswordSchema`. `SignUpSchema` ikut membawa `redirectTo` agar verifikasi email mendaratkan user di tujuan asal.
- `src/lib/supabase-auth-error.ts` — `mapSupabaseAuthError(unknown): AppError`. Memetakan kode SDK (`invalid_credentials|invalid_grant|email_not_confirmed|user_already_exists|email_exists|signup_disabled|weak_password|same_password|over_email_send_rate_limit|over_request_rate_limit|otp_expired|otp_disabled|user_not_found|user_banned|session_expired|reauthentication_needed|validation_failed`) ke taksonomi 8-kind, dengan fallback per HTTP status (`400→validation, 401→unauthorized, 403→forbidden, 404→not_found, 409→conflict, 422→validation, 429→rate_limit`) lalu `unauthorized`. Tidak pernah membocorkan raw SDK string ke UI.
- `src/app/(auth)/actions.ts` — Server Actions: `signInWithPassword`, `signUpWithPassword`, `signInWithGoogle`, `requestPasswordReset` (anti-enumerasi: hanya rate-limit yang di-surface; lainnya selalu sukses), `updatePassword` (memverifikasi sesi recovery dengan `auth.getUser()` sebelum `auth.updateUser({password})`), `signOut`. Semua jalur error mengonsumsi `mapSupabaseAuthError`; `safeRedirect` mencegah open-redirect.
- `src/app/(auth)/callback/route.ts` — bedakan jalur recovery (`next=/auth/update-password`) dan OAuth biasa: kegagalan recovery → `/auth/sign-in?error=reset_token_invalid`, lainnya → `?error=callback_failed`.
- `src/config/routes.ts` — tambah `UPDATE_PASSWORD_ROUTE`, `RESET_PASSWORD_ROUTE`, dan helper `shouldRedirectAuthenticatedAway(pathname)` yang mengecualikan `/auth/update-password` dari redirect dashboard (sesi recovery yang baru ditukar oleh callback tetap dianggap "authenticated").
- `src/config/app.ts` — `PUBLIC_ROUTES` mendapat `/auth/update-password`.
- `src/proxy.ts` — mengganti `isAuthRoute` dengan `shouldRedirectAuthenticatedAway` agar recovery flow tidak ditendang ke `/map`.
- **Perbaikan struktur folder**: route auth dipindah dari `src/app/(auth)/<route>/` ke `src/app/(auth)/auth/<route>/`. Route group `(auth)` di Next.js App Router meng-strip segmen, jadi struktur lama secara teknis mengeksposnya di `/sign-in` padahal seluruh konstanta (`SIGN_IN_ROUTE`, `PUBLIC_ROUTES`, proxy matcher, tes E2E, dan link landing) mengasumsikan `/auth/sign-in`. Penambahan literal segmen `auth/` menyelaraskan URL aktual dengan kontrak konfigurasi.

**UI (semuanya konsumsi `@/config/auth`):**

- `src/app/(auth)/layout.tsx` — kolom kiri brand panel hanya pada `lg+` dengan dua decorative blur halo + logo brand asli, kolom kanan form dengan back-to-home link pada mobile/tablet.
- `src/app/(auth)/_components/password-input.tsx` — `PasswordInput` client primitive dengan toggle show/hide (button asli, `aria-pressed` + label dinamis, target sentuh 44×40 px di pojok kanan input).
- `src/app/(auth)/_components/google-form.tsx` — form OAuth terpisah dengan pending state isolasi (`useFormStatus`).
- `src/app/(auth)/_components/auth-feedback.tsx` — banner inline (`tone: error|success|info`, `role=alert|status` otomatis).
- `src/app/(auth)/_components/auth-separator.tsx` — separator "atau".
- `src/app/(auth)/sign-in/page.tsx` + `sign-in-form.tsx` — `useActionState(signInWithPassword)`, hidden `redirectTo`, link "Lupa kata sandi?", banner gabungan `?error=` + action error.
- `src/app/(auth)/sign-up/page.tsx` + `sign-up-form.tsx` — empat field (nama, email, password, konfirmasi), success banner verifikasi email setelah submit, membawa `redirectTo`.
- `src/app/(auth)/reset-password/page.tsx` + `reset-password-form.tsx` — single email field, success banner generik anti-enumerasi.
- `src/app/(auth)/update-password/page.tsx` + `update-password-form.tsx` — password + konfirmasi, redirect ke `/map` saat sukses.

**Test:**

- `src/schemas/auth.test.ts` — kunci batas password & display name, fail path mismatch confirmPassword, optional redirectTo.
- `src/lib/supabase-auth-error.test.ts` — mapping per kode + per HTTP status + fallback unauthorized + jaminan tidak membocorkan raw message.
- `src/config/auth.test.ts` — kontrak struktural copy, footer link routing, mapper `getAuthErrorMessage` (dikenal + nullish + fallback).
- `tests/e2e/auth.spec.ts` — sign-in fields/CTA/Google/forgot-link visible, validasi inline pada submit kosong, banner `?error=callback_failed`, navigasi forgot→reset, sign-up fields lengkap, no-overflow sweep 360/768/1440 px untuk semua rute auth.

**Keamanan & a11y:**

- Anti-enumerasi: `requestPasswordReset` hanya membedakan rate-limit dari sukses generik. Codes yang membocorkan keberadaan akun tetap dipetakan tapi pesan generik dipilih untuk Server Action ini.
- Recovery flow: `updatePassword` memanggil `auth.getUser()` dulu sebelum `auth.updateUser()` untuk menolak request tanpa cookie recovery yang valid.
- `PasswordInput` toggle: `aria-pressed`, `aria-controls`, label "Tampilkan/Sembunyikan kata sandi" yang ditukar saat toggle.
- Banner: `role="alert"` untuk error, `role="status"` untuk sukses.
- Semua field punya `<Label htmlFor>` + `autoComplete` + `inputMode` yang sesuai (email pakai `email`).

**Yang sengaja TIDAK dibangun:**

- Tidak ada use case baru, port baru, atau migrasi DB — Supabase Auth menyediakan store-nya sendiri. Profil aplikasi (`profiles`) sudah dibuat lewat trigger Stage 2 saat user signs up; halaman Profil baru akan menyentuh `profiles` di Stage 4 Account.

### 10e. Hasil Stage 4 — Halaman Account (2026-05-25)

`/account` dinaikkan dari skeleton Stage 3 menjadi halaman produksi: form edit preferensi penuh (nama tampilan, tema, locale) dengan Server Action terverifikasi Zod, dialog konfirmasi sign-out, semua state (loading/error/empty), serta dedup fetch profil per-request via React `cache()` agar layout `(app)` dan halaman `/account` hanya menyentuh Supabase sekali per render.

**Deliverable struktural:**

- `src/config/locales.ts` — sumber tunggal `SUPPORTED_LOCALES = ["id-ID"]` + tipe `SupportedLocale`, `DEFAULT_LOCALE` (mirror `APP_LOCALE`), guard `isSupportedLocale`. Mencegah drift antara `inputLocaleSchema`, selector form, dan CHECK ladder DB.
- `src/config/account.ts` — copy halaman, kartu, dan dialog: `ACCOUNT_ROUTE`, `ACCOUNT_PAGE_COPY`, `ACCOUNT_FORM_COPY` (label + hint + placeholder + tombol + `successMessage`), `ACCOUNT_DETAILS_COPY` (email/role/userId), `ACCOUNT_SIGN_OUT_COPY` (trigger + dialog + `confirmLabel`/`cancelLabel`), `ACCOUNT_EMPTY_STATE_COPY`, `ACCOUNT_ERROR_STATE_COPY`, `ACCOUNT_GENERIC_ERROR`. Daftar opsi: `THEME_OPTIONS` (mirror `THEME_PREFERENCES`) + `THEME_LABEL`, `LOCALE_OPTIONS` (mirror `SUPPORTED_LOCALES`), `ROLE_LABEL` (mirror `USER_ROLES`). Tidak ada literal copy/role/theme di komponen.
- `src/schemas/account.ts` — `inputLocaleSchema` (strict `z.enum(SUPPORTED_LOCALES)` untuk input user) memisah diri dari `localeSchema` (permisif, dipakai `mapProfileRow` agar locale legacy di DB tidak mematikan boot). `displayNameSchema` di-faktor lewat `z.preprocess` (trim → null bila kosong), batas `DISPLAY_NAME_MIN/MAX_LENGTH = 1/80`. `updateProfilePreferencesInputSchema` `.strict()` (tolak field tak dikenal).
- `src/lib/account-cache.ts` — `profileTag(userId)` (format `user:{userId}:profile`, konsisten dengan §5.2 dan §5.3) + `fetchCurrentProfile = cache(...)` yang membuat Supabase client request-scoped lalu menjalankan `getCurrentProfile`. React `cache()` dipilih (bukan `unstable_cache`) karena Supabase client bergantung pada cookies; revalidasi lintas-request tetap memakai tag.
- `src/app/(app)/account/actions.ts` — Server Action `updateProfile(prev, formData) → UpdateProfileFormState { ok, message?, fieldErrors?, profile? }`:
  1. `requireServerSession()`,
  2. Zod parse via `updateProfilePreferencesInputSchema` → `validationFromFlatten` saat invalid,
  3. Composition root `makeUseCases(client).updateUserProfile.execute(...)`,
  4. `revalidateTag(profileTag(session.userId))` saat ok,
  5. mapping Result → struktur DTO-friendly (entity domain tidak bocor).

  Konstanta publik: `INITIAL_UPDATE_PROFILE_STATE`, `UPDATE_PROFILE_GENERIC_ERROR`.

- `src/components/primitives/feedback-banner.tsx` (+ ekspor di `index.ts`) — `FeedbackBanner` baru: `tone: error|success|info|warning`, `role` otomatis (`alert` untuk error, `status` untuk lainnya). Menggantikan kebutuhan import `AuthFeedback` lintas folder.

**UI (semua mengkonsumsi `@/config/account`):**

- `src/app/(app)/account/page.tsx` — Server Component dibungkus `<Suspense fallback={<AccountSkeleton/>}>`. `AccountContent` memetakan Result:
  - `not_found` → `<EmptyState>` (`ACCOUNT_EMPTY_STATE_COPY`),
  - error lain → `<ErrorState>` (`ACCOUNT_ERROR_STATE_COPY`),
  - sukses → grid dua kolom (`lg:grid-cols-3`): kolom kiri (`lg:col-span-2`) berisi `ProfileForm`, kolom kanan berisi `AccountDetailsCard` (email + role + userId, monospace + `break-all` untuk UUID) dan `SignOutCard`.
- `src/app/(app)/account/_lib/update-profile-state.ts` — tipe `UpdateProfileFormState` + `INITIAL_UPDATE_PROFILE_STATE`. Dipisah dari `actions.ts` karena Next 16 menolak ekspor non-async dari modul `"use server"`.
- `src/app/(app)/account/_components/profile-form.tsx` (Client) — `useActionState(updateProfile, INITIAL_UPDATE_PROFILE_STATE)`. Field: `Input` displayName (trim + maxLength=80 + autocomplete `nickname`), `Select` tema (dari `THEME_OPTIONS`), `Select` locale (`disabled` saat hanya satu opsi). Dirty-detection (trim-aware) mengaktifkan tombol Simpan + memunculkan tombol Batalkan. Saat action ok: ulang-sinkron `setValues(toFormValues(state.profile))` lewat pola _storing-information-from-previous-renders_ (perbandingan `state !== seenState` di body render — bukan Effect) + `useTheme().setTheme(profile.themePreference)` di Effect (sinkronisasi sistem eksternal) agar tema langsung berubah tanpa menunggu round-trip berikutnya. Error: field-level via `state.fieldErrors`, banner umum via `FeedbackBanner tone="error"`. `useFormStatus` menjaga pending state per tombol.
- `src/app/(app)/account/_components/sign-out-dialog.tsx` (Client) — trigger `<Button variant="outline">` membuka `<Modal variant="centered">`. Footer berisi form `action={signOut}` dengan tombol Batal (close) + `ConfirmSignOutButton` (`variant="danger"`, pending state via `useFormStatus`). Konfirmasi destruktif mencegah sign-out tak sengaja di mobile.
- `src/app/(app)/layout.tsx` — diganti memakai `fetchCurrentProfile(session.userId)` (bukan lagi memanggil use case langsung). Akibatnya `FloatingHeader` dan `/account` page berbagi satu hasil fetch per request.

**State triplet (project guidelines §11):**

- Loading: `AccountSkeleton` mereplikasi bentuk akhir (header card + form + dua kartu kanan), dipakai sebagai `<Suspense>` fallback.
- Error: `<ErrorState>` dengan copy ramah (`ACCOUNT_ERROR_STATE_COPY`), tidak menampilkan stack/IDs (sesuai §12).
- Empty: `<EmptyState>` saat `not_found` (kasus jarang: trigger insert profil belum berjalan).

**Caching & invalidasi:**

- `fetchCurrentProfile` membungkus per-request dedup; `updateProfile` memanggil `revalidateTag(profileTag(userId))` setelah sukses. Tabel route §5.2 (`/account` → `user:{userId}:profile`) dan tabel mutator §5.3 (`updateUserProfile` → `user:{userId}:profile`) sudah selaras.

**Test:**

- `src/schemas/account.test.ts` — `userRoleSchema`, `themePreferenceSchema`, `inputLocaleSchema`, `displayNameSchema` (trim, null on empty, batas max), `updateProfilePreferencesInputSchema` (happy path, null displayName, tolak theme/locale tak dikenal, tolak field ekstra via `.strict()`).
- `src/config/account.test.ts` — semua copy non-kosong, `THEME_OPTIONS` mirror `THEME_PREFERENCES`, `LOCALE_OPTIONS` mirror `SUPPORTED_LOCALES`, `ROLE_LABEL` cakup `USER_ROLES`.
- `src/config/locales.test.ts` — `SUPPORTED_LOCALES` non-empty, format BCP-47 valid, `DEFAULT_LOCALE` ada di list, narrowing `isSupportedLocale`.
- `src/components/primitives/feedback-banner.test.tsx` — render pesan, `role=alert` untuk error, `role=status` untuk lainnya, override role eksplisit.
- `src/app/(app)/account/_components/profile-form.test.tsx` — render values awal, tombol Simpan disabled saat pristine, dirty-detection mengaktifkan + memunculkan Reset, tombol Reset mengembalikan nilai, success path (banner sukses + `setTheme` dipanggil), field-level error path, general error banner.
- `src/app/(app)/account/_components/sign-out-dialog.test.tsx` — dialog tertutup awalnya, trigger membuka, cancel menutup tanpa memanggil `signOut`.
- `tests/e2e/account.spec.ts` — anonymous GET `/account` di-redirect ke `/auth/sign-in`; sweep no-overflow 360/768/1440 px pada redirect target.

**Yang sengaja TIDAK dibangun:**

- E2E happy-path penuh (`display profile → edit name → sign out`) di-defer karena belum ada fixture user uji yang ter-seed Supabase. Auth-fixture stack akan dibangun saat halaman pertama yang mutasi DB (Tracker → tambah anak / pengukuran) tiba.
- Tidak ada migrasi schema, port baru, atau use case baru — semua infrastruktur sudah ada sejak Stage 2.
- Locale selector dirender tapi `disabled` saat `SUPPORTED_LOCALES.length === 1`; menambah locale berikutnya tinggal mengubah `SUPPORTED_LOCALES` (dan CHECK ladder DB lebih dahulu).

**Verifikasi yang masih harus dilakukan manual sebelum DoD §24:**

- Sweep responsif manual 360/768/1440 + Slow 3G + Low-end CPU pada `/account` dalam keadaan sign-in.
- Lighthouse mobile pada `/account`.
- axe-core scan via CI preview.

### 10f. Hasil Stage 4 — Halaman Peta (2026-05-25)

`/map` dinaikkan dari skeleton ke halaman produksi: choropleth SVG kabupaten/kota Indonesia (server-rendered, tanpa library peta runtime), slider tahun 2021-2024 yang menulis URL, toggle sumber data observasi/prediksi dengan auto-fallback, legenda tiga kelas ordinal + count per kategori, dan panel detail wilayah dengan tabel riwayat antar tahun dan probabilitas prediksi. Wiring backend penuh (4 use case di critical path + 2 use case kondisional saat ada selection). Lihat [ADR-0002](adr/0002-map-renderer.md) untuk pilihan renderer.

**Deliverable struktural:**

- `src/config/map.ts` — sumber tunggal copy + token UI peta: `MAP_YEAR_PARAM="tahun"`, `MAP_SOURCE_PARAM="sumber"`, `MAP_SELECTION_PARAM="wilayah"`, `MAP_SOURCES=["actual","predicted"]`, `DEFAULT_MAP_SOURCE`, `DEFAULT_MAP_YEAR=MAX_YEAR`, `INDONESIA_BBOX` (94.5..141.5°E × −11.5..6.5°N), `MAP_VIEWBOX={width:1000,height:380}`, `CATEGORY_FILL_CLASS` (Rendah/Sedang/Tinggi → token `fill-ordinal-*`), `CATEGORY_BADGE_TONE`, `MAP_LEGEND`, `MAP_SOURCE_OPTIONS`, `MAP_COPY` (eyebrow/title/description/empty-state copy).
- `src/lib/geo/projection.ts` — `makeProjector(bbox, viewBox): (lon,lat)=>[x,y]`. Persamaan linier murni (~0.5 KB), tanpa dependency. Test `projection.test.ts` mengunci sudut bbox dan mid-point.
- `src/lib/geo/path-builder.ts` — `buildPathFromGeometry(geometry, project): string` mengubah GeoJSON Polygon/MultiPolygon menjadi `d="M…L…Z…"`. Skip ring < 3 titik, mengabaikan koordinat invalid. Test `path-builder.test.ts` mencakup Polygon, MultiPolygon, ring kosong, geometry tak dikenal.
- `src/components/features/map/map-search-params.ts` — `parseMapSearchParams(raw)` mengembalikan `{ tahun, sumber, selection }` ter-narrowed (regex `/^\d{4}$/u`, fallback ke default kalau tidak valid); `buildMapHref(current, patch)` menggabungkan URLSearchParams dengan dukungan delete (`null`). Test `map-search-params.test.ts` (11 case).
- `src/components/features/map/map-data.ts` — `buildMapFeatures({regions,boundaries,indicators,predictions}): MapFeature[]` (join 4 dataset per `kodeBps`, simpan kategori observed + predicted + prevalence), `countByCategory(features, source)`, `mergeYearlyRows(history, predictions)` (gabung per `tahun` untuk tabel detail). Pure, tanpa React. Test `map-data.test.ts` mencakup join, fallback null, count, merge.

**Domain & application layer (Migration Sequence Protocol §8 dijalankan tanpa skema baru):**

- Port `ModelPredictionRepository` (`src/domain/model/ports/model-prediction-repository.ts`) ditambah method `findByVersionAndRegion(version, kodeBps): Promise<Result<readonly ModelPrediction[], AppError>>`. Implementasi Supabase (`src/infrastructure/supabase/model/supabase-model-prediction-repository.ts`) memakai `.eq("model_version", version).eq("kode_bps", kodeBps).order("tahun", { ascending: true })`. Tidak ada port atau method baru di `RegionIndicatorsRepository` — `findByRegion` sudah ada.
- `src/application/region/use-cases/list-region-indicators-history.ts` — `ListRegionIndicatorsHistoryUseCase.execute(kodeBps)` membungkus `RegionIndicatorsRepository.findByRegion`, memetakan setiap row ke `RegionIndicatorsDto`.
- `src/application/model/use-cases/list-predictions-by-region.ts` — `ListPredictionsByRegionUseCase.execute(version, kodeBps)` membungkus `ModelPredictionRepository.findByVersionAndRegion`, memetakan ke `ModelPredictionDto`.
- `src/composition/index.ts` — `UseCases` interface + `makeUseCases` ditambah `listRegionIndicatorsHistory` dan `listPredictionsByRegion`, masing-masing memakai `regionIndicatorsRepo` dan `modelPredictionRepo` yang sudah dibuat di scope per-request.

**UI peta (semua mengkonsumsi `@/config/map`):**

- `src/components/features/map/map-paths.tsx` (Server) — `<svg viewBox="0 0 1000 380" role="img" aria-label>` membungkus per region sebagai `<a href={buildHref(kodeBps)} data-kode-bps={kodeBps} aria-label="Buka detail …">` + `<path d={buildPathFromGeometry(...)} vectorEffect="non-scaling-stroke" />`. Fill class: `CATEGORY_FILL_CLASS[category]` atau `fill-muted` saat data tidak tersedia. Selection: `stroke-foreground stroke-[1.5] [paint-order:stroke]`. Hover: `hover:stroke-foreground`. Focus: `focus-visible:stroke-focus focus-visible:stroke-[1.5]`. Tidak ada `useEffect`/event listener — anchor HTML murni.
- `src/components/features/map/map-viewer.tsx` (Client) — wrapper tipis: `useTransition` + `useRouter`; `onClick` memanggil `closest("a[data-kode-bps]")` lalu `router.replace(href, { scroll: false })` di dalam transition. Modifier-click (meta/ctrl/shift/middle button) di-pass-through ke native sehingga "open in new tab" tetap bekerja. `onKeyDown` menangani Enter/Space. Ship hanya satu listener delegasi (≪ 1 KB gzipped).
- `src/components/features/map/map-legend.tsx` (Server) — `<section aria-labelledby>` menampilkan tiga swatch `bg-ordinal-*` (token, di-derive dari `CATEGORY_FILL_CLASS.replace(/^fill-/, "bg-")`) + label. Opsi `counts` (`Record<Category|"tidak-tersedia", number>`) memunculkan baris jumlah; baris "tidak tersedia" hanya tampil bila count > 0.
- `src/components/features/map/year-slider.tsx` (Client) — `<input type="range" min={SUPPORTED_YEARS[0]} max={SUPPORTED_YEARS.at(-1)} step={1}>` + `<datalist>` tick + tombol tahun cepat. `h-11` touch target, `accent-primary`, `focus-visible:ring`. Komit nilai via `router.replace(${pathname}${buildMapHref(searchParams, { [MAP_YEAR_PARAM]: value })}, { scroll: false })` di dalam `startTransition`; nilai live ditampilkan di `<output>` untuk umpan balik.
- `src/components/features/map/source-toggle.tsx` (Client) — `role="radiogroup"` + dua `role="radio"` (`aria-checked`). Tombol "Prediksi model" di-disabled saat `predictedAvailable=false`. Hint copy per opsi dirender di `<dl>` di bawahnya. `h-11` touch target.
- `src/components/features/map/region-detail-panel.tsx` (Server) — empty state via `<EmptyState>` saat `region=null`. Saat ada wilayah: header (provinsi/kabupatenKota/kodeBps), `<Link>` close (drop param `wilayah` lewat `buildMapHref(currentSearch, { [MAP_SELECTION_PARAM]: null })`), grid metrik (kategori observasi, kategori prediksi, prevalensi, sumber aktif) dengan `Badge` bertone `CATEGORY_BADGE_TONE`, `ProbabilityBars` (`role="progressbar"` + `aria-valuenow`) hanya saat `source==="predicted"`, dan tabel riwayat tahun-per-tahun dari `mergeYearlyRows(history, predictions)` diurutkan via `SUPPORTED_YEARS`.

**Route entry (`src/app/(app)/map/`):**

- `page.tsx` — `export const dynamic = "force-dynamic"` (URL search params menentukan fetch). Parse search via `parseMapSearchParams`, serialize `currentSearch` via `URLSearchParams` (sekali, dipakai semua tombol/link). Parallel fetch (4 use case): `listRegions`, `listRegionBoundaries`, `listRegionIndicatorsByYear(tahunVO)`, `getDefaultModelMetadata`. Saat `defaultModel != null`: panggil `listPredictionsByYear(modelVersion, tahunVO)`. Setiap Result tidak-ok memicu `<PageShell>` dengan `<ErrorState>` ramah (tanpa stack). `effectiveSource` jatuh ke `"actual"` saat user minta `"predicted"` tapi `predictions.length === 0`; `predictedAvailable` mendrive disable di `<SourceToggle>`. Selection di-validasi `isKodeBps(...)` dan harus ada di `regions`. Jika ada `selectedRegion`: parallel fetch `listRegionIndicatorsHistory(kodeBps)` + (bila ada modelVersion) `listPredictionsByRegion(modelVersion, kodeBps)`. Layout: `grid lg:grid-cols-[minmax(0,2.4fr)_minmax(20rem,1fr)]` — kolom kiri map + empty state "Prediksi belum tersedia" kondisional, kolom kanan YearSlider + SourceToggle + MapLegend + RegionDetailPanel.
- `loading.tsx` — Server skeleton mirror layout produksi: header + `<Skeleton style={{ aspectRatio: \`${MAP_VIEWBOX.width} / ${MAP_VIEWBOX.height}\` }}>`di kiri + empat`<Skeleton>`ber-rounded di kanan.`aria-busy="true"`+`<span className="sr-only">Memuat peta sebaran stunting…</span>`.
- `error.tsx` — `"use client"` route segment error boundary. `<ErrorState>` ramah + `correlationId={error.digest}` (Sentry sudah meng-capture stack via Next integration), tombol "Coba lagi" memanggil `reset()`. Dev-only `console.error` di `useEffect`.

**State triplet (project guidelines §11):**

- Loading: `loading.tsx` skeleton + `<Suspense>` boundary level halaman.
- Error: `<ErrorState>` di tiap Result not-ok + `error.tsx` untuk error tak terduga + `<EmptyState>` per-kasus (lihat di bawah).
- Empty: tiga sub-kasus eksplisit — (a) `noBoundariesTitle` saat tabel `region_boundaries` kosong (skrip import belum dijalankan), (b) `noPredictionsTitle` saat `sumber=predicted` tapi predictions kosong (auto-fallback ke `actual` + opsi predicted di-disabled), (c) `selectionEmptyTitle` di panel kanan saat belum ada `?wilayah=`.

**Performance dan responsiveness:**

- Tidak ada client JS dari renderer peta (semua HTML server). `<MapViewer>`, `<YearSlider>`, `<SourceToggle>` adalah satu-satunya komponen `"use client"` — ketiganya ringan.
- Grid `lg:grid-cols-[minmax(0,2.4fr)_minmax(20rem,1fr)]` tumpuk vertikal di < `lg` (desktop-primary, mobile-friendly tanpa rewrite).
- Semua tombol/anchor patuh touch target ≥ 44×44px.
- Anchor wilayah punya `aria-label` deskriptif; fokus visible via `focus-visible:stroke-focus` (token).
- Tidak ada hover-only — semua hover state punya equivalent klik (tap = selection).

**Caching:**

- Page `dynamic = "force-dynamic"`. Data freshness diserahkan ke cache tag use case underlying (`region-boundaries`, `region-indicators:{tahun}`, `model-predictions:{version}:{tahun}`, opsional `region-indicators-history:{kodeBps}` dan `model-predictions:{version}:{kodeBps}` saat ada selection).
- Tabel route §5.2 sudah diselaraskan.

**Test:**

- `src/lib/geo/projection.test.ts` — sudut bbox dipetakan ke (0,0) dan (width,height), invers tidak diperlukan.
- `src/lib/geo/path-builder.test.ts` — Polygon, MultiPolygon, ring < 3 titik di-skip, geometry tak dikenal kembalikan string kosong.
- `src/components/features/map/map-search-params.test.ts` — parse default, year valid/invalid/array, source valid/invalid, selection regex `^\d{4}$`; `buildMapHref` empty/preserve/override/delete/append (11 case).
- `src/components/features/map/map-data.test.ts` — join 4 dataset, category fallback `null`, `countByCategory` per sumber, `mergeYearlyRows` order + key collision.
- `src/components/features/map/map-legend.test.tsx` — render 3 swatch, accessibility role, baris "tidak tersedia" muncul hanya saat count > 0 (5 case).
- `src/components/features/map/year-slider.test.tsx` — initial value, slider control, perubahan memanggil `router.replace` (mock `next/navigation`), disable saat single year (5 case).
- `src/components/features/map/source-toggle.test.tsx` — radiogroup roles, `aria-checked`, click memanggil router, predicted disabled saat `predictedAvailable=false` (5 case).
- `src/components/features/map/region-detail-panel.test.tsx` — empty state, header data, close link drop selection, badge tone, probability bars hanya saat source=predicted, tabel history (7 case).
- `src/components/features/map/map-viewer.test.tsx` — click pada anchor → `router.replace`, click di luar anchor → noop, ctrl-click pass-through native, Enter aktifkan navigasi, key lain di-ignore (5 case).
- `tests/e2e/map.spec.ts` — anonymous GET `/map` di-redirect ke `/auth/sign-in`; sweep no-overflow 360/768/1440 px pada redirect target (kontrak anonymous-guard + layout invariants).

**Yang sengaja TIDAK dibangun:**

- E2E happy-path penuh terautentikasi (year slider → URL → re-render, klik region → panel detail, source toggle) di-defer karena belum ada fixture user uji yang ter-seed Supabase. Konsisten dengan §10e (`/account`).
- Tidak ada library peta runtime (lihat ADR-0002). Bila kelak butuh pan/zoom, ADR baru akan memilih jalur.
- Pan/zoom, hover tooltip per-region, dan basemap raster bukan bagian MVP.
- `/map/regions/[kodeBps]` (route dinamis terpisah) di-drop dari §5.2; panel detail terjadi di `/map?wilayah=<kodeBps>`. Bila kelak butuh deep-page wilayah (mis. mode print friendly), bisa ditambahkan tanpa membongkar use case.

**Verifikasi yang masih harus dilakukan manual sebelum DoD §24:**

- Sweep responsif manual 360/768/1440 + Slow 3G + Low-end CPU pada `/map` dalam keadaan sign-in (perlu fixture lokal yang manual login).
- Lighthouse mobile pada `/map` setelah fixture data tersedia (regions + boundaries + indicators + predictions di-import lewat skrip).
- axe-core scan via CI preview.
- Smoke test pada perangkat mid-range Android nyata setelah import data selesai.

---

### 10f-redux. Hasil Stage 4 — Redesign Peta (2026-05-27)

`/map` di-redesain inspirasi GeoPangan: peta sebagai canvas utama dengan panel mengambang. Data pipeline ditegakkan sebelum UI agar verifikasi visual realistis.

**Pipeline data (baru, prasyarat verifikasi):**

- `scripts/_lib/script-context.ts` — admin Supabase client + JSON logger + runScript wrapper untuk seluruh skrip lokal.
- `scripts/import-regions.ts` — Dataset.xlsx → `regions` (540 baris ter-upsert).
- `scripts/import-boundaries.ts` — orkestrasi konversi `.gpkg` → GeoJSON tersimplifikasi → `region_boundaries` (514 ter-upsert; 1 unmatched WADMKK "Minahasa Selatan/Bolaang Mongondow Timur").
- `scripts/export-boundaries-from-gpkg.py` — helper Python (sqlite3 stdlib + shapely) menggantikan mapshaper karena `better-sqlite3` tidak bisa dibangun tanpa Visual Studio Build Tools di Windows.
- `scripts/import-indicators.ts` — Sheet `Source` (header Indonesia: Dimensi/Variabel/Keterangan/Tautan Sumber) → `indicator_dictionary` (22 entri Y/Y1/X1..X20); Sheet `Dataset` → `region_indicators` (2056 baris 540×4 tahun). Drift dimensi DB (`outcome|socioeconomic|health_service|environment|demography|nutrition|other`) vs GLOSSARY (Sosial-Ekonomi/Pendidikan/...) ditangani lewat `mapDimensionLabel()` dengan `inferDimension()` sebagai fallback.
- `scripts/export-model-from-rds.R` + `scripts/import-model.ts` — pipeline opsional untuk `tahap5D_gtwenolr_adaptif.rds` (perlu R/Rscript; **belum dijalankan** pada snapshot ini — UI tampil `actual` saja, `predicted` masuk empty state).
- `package.json` — scripts `import:regions`, `import:boundaries`, `import:indicators`, `import:model`, `import:all`. Deps tambahan: `xlsx` (via CDN SheetJS), `mapshaper` (devDependency walau tidak terpakai langsung; dipertahankan untuk simplifikasi geometri future). `pnpm-workspace.yaml#allowBuilds` mengaktifkan `better-sqlite3` bila Windows Build Tools tersedia kelak.

**Komponen UI baru di `src/components/features/map/`:**

- `regional-summary-card.tsx` — Server: ringkasan nasional mengambang kiri-atas (rata-rata `y1_prevalence`, distribusi 3 kategori sebagai segmented bar + list persentase, jumlah wilayah, badge versi model).
- `stunting-info-card.tsx` — Client: explainer 3 kategori dengan cut-off WHO (Rendah <20%, Sedang 20%-30%, Tinggi ≥30%). Disclosure pakai tombol controlled, bukan `<details>`, agar bisa diintegrasikan dengan layout overlay.
- `vertical-year-rail.tsx` — Client: radiogroup vertikal di pinggir kanan peta (horizontal pill di mobile). Keyboard ArrowUp/Down + Enter/Space. Tetap pakai `?tahun=YYYY` sebagai sumber state.
- `region-detail-popup.tsx` — Server: panel detail wilayah baru yang menggantikan `region-detail-panel.tsx`. Berisi badge kategori, skor hero, toggle prediksi (deep-link `?sumber=`), 3 stat tile (Peringkat nasional via `rankRegionByPrevalence`, Tipe, Kode BPS), mini-chart 4 titik, tabel YoY observasi vs prediksi, dan ringkasan probabilitas prediksi.
- `mini-history-chart.tsx` — Server: SVG hand-rolled 4 titik (ADR-0003) untuk konsistensi bundle dengan ADR-0002. Nivo disimpan untuk Tracker.
- `onboarding-modal.tsx` + `onboarding-trigger.tsx` — Client: panduan 4 langkah bertema stunting (bukan copy GeoPangan), persist via `localStorage` key `peduli-stunting:map-onboarding-seen-v1`. Tombol "Buka panduan" di pojok kanvas untuk re-trigger.
- `map-paths.tsx` — Enhancement: `<title>` per region untuk hover tooltip native (0 KB JS), `data-has-selection` di root SVG + sibling-selector dim untuk wilayah tidak terpilih saat ada selection, `data-selected` atribut untuk styling.
- `map-legend.tsx` — Refactor: `<details>` collapsible (zero-JS) dibungkus `<section aria-labelledby>` agar landmark "region" tetap diekspos.
- `map-data.ts` — Helper baru: `computeRegionalSummary(indicators)`, `rankRegionByPrevalence(indicators, kodeBps)`, `mergeYearlyRows(observed, predicted)`. Semua murni, ditest unit.

**Config (`src/config/map.ts`) tambahan:**

- `MAP_SUMMARY_COPY`, `STUNTING_CATEGORY_THRESHOLDS`, `STUNTING_INFO_COPY`, `MAP_DETAIL_COPY`, `YEAR_RAIL_COPY`, `MAP_ONBOARDING_STEPS`, `ONBOARDING_COPY`, `ONBOARDING_STORAGE_KEY`, `CATEGORY_BG_CLASS`, `CATEGORY_TEXT_CLASS`, `CATEGORY_ORDER`.

**Layout (`src/app/(app)/map/page.tsx`):**

- Mobile (default) stacking: ringkasan → info → peta → year rail (horizontal) → toolbar (onboarding + legend) → detail popup.
- Desktop (`lg+`): peta full-bleed; ringkasan & info mengambang absolute di pojok atas; year rail vertikal kanan-tengah; onboarding trigger + legend mengambang bawah. Detail popup tetap di bawah peta (full width) supaya tidak menutupi peta.
- PageShell mempertahankan `PageHeader` (eyebrow + title + description) di atas canvas.

**ADR-0003** — `docs/adr/0003-map-mini-chart.md`: keputusan SVG hand-rolled untuk mini-chart map (hemat bundle ~145 KB), Nivo tetap rencana untuk Tracker.

**Gate lokal:**

- `npx tsc --noEmit` → 0 error.
- `npx eslint . --max-warnings=0` → 0 warning.
- `npx vitest run` → 47 file / 417 tes hijau. 16 tes baru menutup `computeRegionalSummary`, `rankRegionByPrevalence`, dan `mergeYearlyRows`.
- `npx next build` → semua route compile, `/map` `ƒ Dynamic`.

**Status data Supabase setelah skrip jalan:**

- `regions`: 540
- `region_boundaries`: 514 (1 mismatch dicatat)
- `indicator_dictionary`: 22
- `region_indicators`: 2056
- `model_metadata` / `model_predictions`: kosong (menunggu R/Rscript untuk parse `.rds`)

**Yang sengaja DITUNDA:**

- Tes komponen untuk RegionalSummaryCard / StuntingInfoCard / VerticalYearRail / RegionDetailPopup / OnboardingModal — helper logic sudah ditest unit; tes komponen ditambahkan saat ada keluhan kualitas dari sweep responsif manual.
- Import model GTWENOLR (perlu Rscript atau `pyreadr`).
- Sweep manual 360/768/1440 + Slow 3G — perlu user atau perangkat fisik.
- Cleanup file `region-detail-panel.tsx` lama (tidak lagi dipakai di route tapi tetap mengandung tes yang berguna — dibiarkan sampai migrasi tes ke komponen baru).

**Bersih-bersih opportunistik:**

- 51 file duplikat `* (1).ts/tsx/css` (hasil "Save As" yang nyasar) dihapus karena tidak ter-track git dan menggagalkan typecheck/lint.

---

### 10f. Hasil Stage 4 — Halaman Dashboard (2026-05-25)

`/dashboard` dibawa ke kualitas produksi: tanpa hardcode angka, seluruh konten dibaca dari `model_metadata` + `indicator_dictionary` + (opsional) `model_coefficients`. Empty state instruksional dipasang untuk setiap blok yang menunggu pipeline R, sehingga halaman tetap informatif sebelum ekspor koefisien tersedia.

**Deliverable struktural:**

- `src/config/dashboard.ts` — sumber tunggal copy halaman: `DASHBOARD_HEADER`, `DASHBOARD_METRICS_SECTION` (+ `DASHBOARD_METRIC_TILES` mendefinisikan kunci `accuracy`/`qwk`/`mae`/`log_score`), `DASHBOARD_COMPARISON_SECTION` (+ peta kolom 6-model), `DASHBOARD_MORAN_SECTION`, `DASHBOARD_DICTIONARY_SECTION`, `DASHBOARD_CONTRIBUTION_SECTION`, `DASHBOARD_WHATIF_SECTION`, dan rentang slider `DASHBOARD_WHATIF_DELTA` (`min=-3, max=3, step=0.1, default=0`). `src/config/dashboard.test.ts` mengunci kontrak struktural.
- `src/config/predictor-dimensions.ts` — peta presentasi DB enum (`outcome|socioeconomic|nutrition|health_service|environment|demography|other`) → label + caption Bahasa Indonesia. `PREDICTOR_DIMENSION_ORDER` mengatur urutan section. `src/config/predictor-dimensions.test.ts` memvalidasi pemetaan lengkap.
- `src/schemas/model.ts` — tambahan Zod helpers (`numericLike`, `finiteNumber`), `modelComparisonEntrySchema`, `modelMetricsPayloadSchema` (lenient via `passthrough`), dan `parseMoranPerYear(payload)` yang mendukung dua bentuk JSON (`{"2021": 0.18}` atau `{"2021": {moran_i: 0.18, p_value: 0.01}}`).
- `src/components/primitives/slider.tsx` + `.test.tsx` — primitive baru wajib untuk what-if: range input dengan readout `<output aria-live="polite">`, `aria-valuetext`, target sentuh `h-11` (>=44px), `ticks`, `hint`, dukungan keyboard penuh. Diekspor dari `src/components/primitives/index.ts`.
- **Domain & application** — port `LocalCoefficientRepository` mendapat `listByVersion(version, tahun?)`. `SupabaseLocalCoefficientRepository` mengimplementasikan dengan `.eq("model_version", version)` + filter opsional tahun. `CoefficientSummaryItemDto`/`CoefficientSummaryDto` + `summariseCoefficients()` mengagregasi koefisien per-prediktor (rata-rata + min/max + jumlah kab/kota + flag inferensi). `GetCoefficientSummaryUseCase` mengembalikan summary kosong (bukan error) bila tabel kosong.
- **Composition root** — `makeUseCases(client)` mendaftarkan `getCoefficientSummary` dan menyiapkan `SupabaseLocalCoefficientRepository`.
- **Section components** (`src/components/features/dashboard/`):
  - `metrics-snapshot.tsx` — tile metrik final memakai `modelMetricsPayloadSchema` + `DASHBOARD_METRIC_TILES` (versi & badge default dari `model_metadata`).
  - `model-comparison-table.tsx` — tabel 6 model dari `metrics.models` (overflow-x-auto + min-width agar tidak meleleh di 360 px).
  - `moran-chart.tsx` — CSS bar chart Moran's I per tahun, badge signifikansi `p<=0.05`, grid 1/2/4 kolom.
  - `predictor-dictionary.tsx` — kamus prediktor per dimensi memakai `PREDICTOR_DIMENSION_ORDER`, sorting alami pada `code` (`X1, X2, ... X10`).
  - `predictor-contribution.tsx` — pengelompokan `effect_direction` (protective/risk/neutral), outcomes dieksklusi.
  - `what-if-section.tsx` (Server wrapper) + `what-if-slider.tsx` (Client) — `WhatIfSlider` menggabungkan ringkasan koefisien dengan kamus indikator untuk label & satuan; estimasi pergeseran log-odds = rata-rata koefisien x delta pengguna.
- `src/app/(app)/dashboard/page.tsx` — orkestrator: `Promise.all([getDefaultModelMetadata, listIndicatorDictionary])` lalu (jika versi default ada) `getCoefficientSummary({version})`. Halaman tetap render lengkap meskipun salah satu fetch gagal — masing-masing section memetakan `Result` ke ErrorState/EmptyState sendiri.
- `tests/e2e/dashboard.spec.ts` — guard anonim + sweep no-overflow 360/768/1440 px (mengikuti pola `tests/e2e/map.spec.ts`; coverage interaktif ditutup oleh unit/komponen).

**Perubahan caching:**

- `/dashboard` sekarang `dynamic` (sebelumnya `ISR(86400)` di rencana §5.2). Alasan: Supabase client terikat cookie sesi sehingga route harus dinamis; tag yang dikonsumsi tetap `model-metadata`, `model-coefficients:{version}`, dan `indicator-dictionary` agar mutasi admin bisa memicu rebuild bila kelak halaman dipromosikan ke ISR setelah pemisahan client publik.

**Anti-pattern yang sengaja DIHINDARI:**

- Tidak ada nilai metrik yang di-hardcode (akurasi 0.716, QWK 0.696, MAE 0.287, log-score -0.645 datang langsung dari `model_metadata.metrics`).
- Tidak ada chart library; visualisasi Moran's I dan barchart kontribusi memakai CSS grid + `style={{ width: percent + "%" }}` (zero KB tambahan).
- Tidak ada inline copy; setiap label berasal dari `src/config/dashboard.ts` atau `predictor-dimensions.ts`.

**Yang sengaja DITUNDA:**

- `/dashboard/variabel/[code]` (drilldown per prediktor) — use case `listRegionIndicatorsByYear` sudah siap.
- Halaman terpisah `/dashboard/what-if` — di-monolitkan dulu ke `/dashboard` sampai trafik membuktikan perlunya split.
- Lighthouse mobile pass — perlu data live di preview Vercel.

**Verifikasi yang masih wajib manual sebelum DoD §24:**

- Sweep responsif 360/768/1440 px + Slow 3G + Low-end CPU pada sesi sign-in nyata (E2E hanya mengunci jalur redirect anonim).
- Lighthouse pada preview deployment setelah `model_coefficients` di-seed.
- axe-core scan pada `/dashboard` setelah login fixture tersedia.

### 10g. Hasil Stage 4 — Halaman Edukasi (2026-05-25)

`/edukasi` dan `/edukasi/[slug]` dibawa ke kualitas produksi: wiring backend penuh ke `education_articles` (tabel publik, RLS allow `authenticated` SELECT), filter topik + rentang usia + pencarian via URL search params, paginasi anchor, render markdown ter-sanitasi (`marked` + DOMPurify), ISR dengan tag invalidation, dan state triplet (loading/error/empty) memakai primitive standar.

**Deliverable struktural:**

- `src/config/education.ts` — sumber tunggal: URL params (`topik`, `usia`, `cari`, `halaman`), `EDUCATION_PAGE_SIZE=12`, `EDUCATION_LIST_REVALIDATE_SECONDS=1800`, `EDUCATION_DETAIL_REVALIDATE_SECONDS=86400`, `EDUCATION_LIST_CACHE_TAG="articles"`, `educationArticleCacheTag(slug)`, `EDUCATION_TOPIC_CATALOG` (9 topik dengan label, deskripsi, badge tone), `EDUCATION_TOPIC_INDEX`, `EDUCATION_AGE_PRESETS` (Prakelahiran + 4 rentang anak 0-6/6-12/12-24/24-60 bulan), `EDUCATION_AGE_PRESET_INDEX`, `EDUCATION_COPY` & `EDUCATION_DETAIL_COPY`, `formatEducationAgeRange`, `formatEducationAudienceLabel`, narrowing helpers `isEducationTopicKey`/`isEducationAgePresetKey`. `src/config/education.test.ts` mengunci kontrak.
- `src/app/(app)/edukasi/_lib/filters.ts` — `parseEdukasiFilters(searchParams)` mengubah raw Next.js search params menjadi `ParsedEdukasiFilters` (`topic`, `agePresetKey`, `search`, `page`); nilai tak dikenal jatuh ke `undefined` (URL malformed tidak pernah memutus render). `toArticleListFilter(parsed, pageSize)` memetakan ke `ArticleListFilter` repository (termasuk derive `ArticleAgeRange` dari preset key). `buildEdukasiHref(base, override)` menggabungkan filter dengan override (`"all"` untuk reset, `null` untuk clear search) — reset `page` ke 1 saat filter selain page berubah, sehingga tidak ada halaman out-of-range. `hasActiveEdukasiFilters` mendrive visibility tombol reset.
- `src/domain/education/ports/education-article-repository.ts` — `ArticleAgeRange` (discriminated union prenatal/child), `ArticleListFilter` (topic/ageRange/search/limit/offset), `ArticleListResult` (`{ items, total }`).
- `src/schemas/education.ts` — `articleAgeRangeSchema` (discriminated union), `articleListFilterSchema` `.strict()` dengan batas (`limit` 1-50, `offset` >= 0, `search` 2-80 chars).
- `src/infrastructure/supabase/education/supabase-education-article-repository.ts` — Implementasi penuh: `.select(..., { count: "exact" })` untuk paginasi, `.range(offset, offset + limit - 1)`, ageRange overlap (prenatal → `.is("min_age_months", null).is("max_age_months", null)`, child → tiga `.or()` overlap test), search via `.or('title.ilike.%X%,summary.ilike.%X%')` dengan `escapeIlikePattern` (escape `\ % _ , ( )` agar PostgREST `or=` aman dari injeksi wildcard/delimiter), `findBySlug` juga mengharuskan `published_at IS NOT NULL` agar artikel draf tak bocor ke detail.
- `src/application/education/use-cases/list-articles.ts` — `ListArticlesUseCase.execute(filter?) → Result<EducationArticleListDto, AppError>` (mapping entity → DTO + `total`).
- `src/application/education/dtos.ts` — `EducationArticleListDto` (`{ items, total }`), `EducationArticleDto.topic: ArticleTopic` (bukan `string`).
- `src/lib/markdown.ts` — `renderArticleMarkdown(source)` server-only: `marked.parse(source, { async: false, gfm: true, breaks: false })` → `DOMPurify.sanitize` dengan `FORBID_TAGS: ["style","script","iframe"]` + `FORBID_ATTR: ["onerror","onload","onclick","style"]` (defence-in-depth meski `body_md` ditulis admin lewat path RLS-guarded).
- `src/lib/education-cache.ts` — `fetchEducationArticles(filter)` + `fetchEducationArticleBySlug(slug)` membungkus `unstable_cache` dengan key per-filter, tag `articles` (list) atau `articles + article:{slug}` (detail), revalidate `EDUCATION_LIST_REVALIDATE_SECONDS` / `EDUCATION_DETAIL_REVALIDATE_SECONDS`. Memakai `createSupabasePublicClient()` (anon, tanpa cookies) karena `unstable_cache` berjalan di luar request scope dan tabel artikel publik (RLS allow SELECT).
- `src/infrastructure/supabase/server-client.ts` — `createSupabasePublicClient()` baru: cookieless anon client untuk reads di luar request scope (mis. callback `unstable_cache`). Wajib: hanya untuk tabel PUB-R, tidak pernah untuk data user-owned.
- Migrasi `supabase/migrations/20260525120900_education_seed.sql` (sebelumnya di-apply): seed 16 artikel idempoten lintas 9 topik dari Buku KIA 2024, masing-masing dengan `body_md`, `source_label`, `source_url`, `published_at`.

**UI (semua mengkonsumsi `@/config/education`):**

- `src/app/(app)/edukasi/page.tsx` — Server Component. `export const revalidate = EDUCATION_LIST_REVALIDATE_SECONDS`. Parse search params → fetch via cache helper → render `PageHeader` + grid `lg:grid-cols-[minmax(0,1fr)_minmax(20rem,2fr)]` (search kiri, filter chips kanan) + grid kartu `sm:grid-cols-2 lg:grid-cols-3` + `EdukasiPagination`. State triplet (loading via `loading.tsx`, error via `ErrorState` + tombol "Muat ulang", empty via `EmptyState` + tombol "Bersihkan filter" kondisional).
- `src/app/(app)/edukasi/loading.tsx` — Skeleton route-level (header + search + filter strip + 12 kartu).
- `src/app/(app)/edukasi/_components/edukasi-search.tsx` — Client. Debounced (`300ms`) search input yang `router.push(href, { scroll: false })` saat panjang query >= `EDUCATION_SEARCH_MIN_LENGTH=2` atau saat input dikosongkan. `useTransition` menjaga UI tetap responsif. `<form role="search">` mendukung submit Enter.
- `src/app/(app)/edukasi/_components/edukasi-filters.tsx` — Server. Filter chips topik & rentang usia sebagai anchor (`<Link prefetch={false}>`), `aria-current="true"` pada chip aktif, tombol "Bersihkan filter" hanya muncul saat ada filter aktif (semua via `buildEdukasiHref`). Tanpa JS — halaman tetap fungsional.
- `src/app/(app)/edukasi/_components/edukasi-pagination.tsx` — Server. `<nav aria-label="Paginasi artikel">` dengan link Prev/Next + status `Halaman N dari M` (`role="status" aria-live="polite"`). Disabled state via `<span aria-disabled>`. Tidak dirender saat `totalPages <= 1`.
- `src/app/(app)/edukasi/_components/article-card.tsx` — Server. Seluruh kartu adalah `<Link>` (target sentuh minimal 44px tinggi); `Badge` topik (tone dari `EDUCATION_TOPIC_INDEX[topic].tone`) + `Badge` rentang usia (bila ada), title `line-clamp-2`, summary `line-clamp-3`, sumber label, dan label "Baca artikel".
- `src/app/(app)/edukasi/[slug]/page.tsx` — Server Component. `export const revalidate = EDUCATION_DETAIL_REVALIDATE_SECONDS`. Fetch via cache helper; `null` → `notFound()`. Header dengan badges, meta `<dl>` (topik, rentang usia, sumber, tanggal terbit dalam locale `id-ID`), body markdown ter-sanitasi di `<div className="prose ...">` (`@tailwindcss/typography`), dan tombol "Buka sumber resmi" (rel="noopener noreferrer"). `generateMetadata` membaca title + summary dari DB.
- `src/app/(app)/edukasi/[slug]/loading.tsx` — Skeleton (back link + header + body lines).
- `src/app/(app)/edukasi/[slug]/not-found.tsx` — `EmptyState` Bahasa Indonesia + tombol kembali ke daftar.

**State triplet (project guidelines §11):**

- Loading: `loading.tsx` di kedua route, skeleton mirror layout produksi, `aria-busy` + `sr-only` status.
- Error: `<ErrorState>` (`EDUCATION_COPY.errorTitle`/`errorDescription`) dengan tombol "Muat ulang" yang link ke `/edukasi` (drop filter).
- Empty: `<EmptyState>` saat hasil 0 artikel; bila ada filter aktif, tombol "Bersihkan filter" dirender. Bila tidak (tabel benar-benar kosong), tombol disembunyikan dan copy "Belum ada artikel cocok" menjelaskan situasi.

**Caching & invalidasi:**

- List: `unstable_cache(['education-articles-list', <filter-json>])`, tag `articles`, revalidate 1800s.
- Detail: `unstable_cache(['education-article', slug])`, tags `articles` + `article:{slug}`, revalidate 86400s.
- Admin mutasi artikel ke depan tinggal `revalidateTag(EDUCATION_LIST_CACHE_TAG)` (flush semua) atau `revalidateTag(educationArticleCacheTag(slug))` (flush satu).

**Performance & responsiveness:**

- Page Server-rendered. Hanya `EdukasiSearch` yang `"use client"` (debounced input wajib browser API).
- Grid kartu: `sm:grid-cols-2 lg:grid-cols-3` (1 kolom di mobile, tanpa horizontal scroll di 360 px).
- Filter chips: `flex flex-wrap gap-2` dengan target sentuh `min-h-11` (≥44px).
- Anchor pagination prev/next: target sentuh `min-h-11`.
- Anchor di kartu artikel mencakup seluruh permukaan kartu (target sentuh besar).
- `prefetch={false}` di anchor filter & pagination mencegah prefetch berlebihan di mid-range Android.

**Aksesibilitas (WCAG 2.1 AA):**

- Heading hierarchy: `h1` PageHeader → `h2` filter section heading (`id="edukasi-filters-heading"`) → `h3` di setiap kartu (CardTitle).
- Filter chips aktif menandai `aria-current="true"`; chips menyertakan `aria-label` deskriptif dari `description`.
- Search field dengan `<Label htmlFor>` + `role="search"` + `inputMode="search"` + `aria-busy` saat transition.
- Pagination `<nav aria-label="Paginasi artikel">` + status `role="status" aria-live="polite"`.
- Detail body memakai `prose` dengan `dark:prose-invert` untuk kontras keduanya.
- Tautan sumber eksternal: `target="_blank" rel="noopener noreferrer"`.
- Focus ring konsisten (`focus-visible:ring-focus`) di setiap link/chip.

**Test (Stage 4 Edukasi):**

- `src/config/education.test.ts` — 23 case kontrak (topic catalog complete & ordered, age presets, helpers, URL param constants).
- `src/schemas/education.test.ts` — slug brand, topic enum, age range schema (kind prenatal/child + min<=max + non-negative), `articleListFilterSchema` (.strict, batas search/limit/offset), `mapEducationArticleRow` (DB row → entity).
- `src/application/education/use-cases/list-articles.test.ts` — empty, mapping DTO+total, filter pass-through, error propagation.
- `src/application/education/use-cases/get-article-by-slug.test.ts` — found, null, error propagation.

**Yang sengaja DITUNDA:**

- Suite Playwright E2E happy-path penuh (sign-in fixture + click filter → URL update → grid re-render → klik kartu → detail load) di-defer hingga fixture user uji ter-seed Supabase, konsisten dengan §10e/§10f.
- Halaman admin untuk CRUD artikel (gating role admin di Stage 5+).

**Verifikasi yang masih harus dilakukan manual sebelum DoD §24:**

- Sweep responsif 360/768/1440 px + Slow 3G + Low-end CPU di sesi sign-in nyata.
- Lighthouse mobile pada `/edukasi` dan `/edukasi/[slug]` setelah preview deployment.
- axe-core scan via CI preview.

### 10h. Hasil Stage 4 — Halaman Tracker (2026-05-25)

`/tracker` dan empat sub-route bersarang (`/tracker/anak/baru`, `/tracker/anak/[childId]`, `.../pengukuran`, `.../imunisasi`, `.../perkembangan`) dibawa ke kualitas produksi: wiring backend penuh ke `children`, `growth_measurements`, `child_immunizations`, `child_milestones` lewat use case + repository yang sudah ada, plus enrichment z-score (WHO LMS) & klasifikasi SD (Buku KIA) di dalam DTO `GrowthMeasurementDto.zScores`/`sdClass`. Recharts dipakai untuk kurva pertumbuhan vs standar WHO. Semua mutasi lewat Server Actions dengan `revalidateTag` pada tag spesifik.

**Deliverable struktural:**

- `src/lib/tracker-cache.ts` — `cache()`-wrapped fetcher dan helper tag: `childrenTag(userId)`, `childTag(childId)`, `measurementsTag(childId)`, `immunizationsTag(childId)`, `milestonesTag(childId)`, `IMMUNIZATION_SCHEDULE_TAG="catalog:immunization-schedule"`, `MILESTONES_CATALOG_TAG="catalog:milestones"`. Fetcher: `fetchChildrenByOwner`, `fetchChildById`, `fetchMeasurementsByChild`, `fetchImmunizationSchedule`, `fetchChildImmunizations`, `fetchMilestoneCatalog`, `fetchChildMilestones`. Semua mengembalikan `Result<…, AppError>` lewat use case factory di `makeUseCases(supabase)`.
- `src/config/tracker.ts` — sumber tunggal seluruh copy & label: `TRACKER_ROUTE`, route helpers (`trackerChildRoute`, `trackerChildMeasurementsRoute`, `trackerChildImmunizationsRoute`, `trackerChildMilestonesRoute`), copy blok (`TRACKER_LIST_COPY`, `ADD_CHILD_COPY`, `CHILD_DETAIL_COPY`, `MEASUREMENTS_COPY`, `IMMUNIZATION_COPY`, `MILESTONE_COPY`), label maps (`SEX_LABEL`, `GROWTH_INDICATOR_LABEL`, `GROWTH_INDICATOR_SHORT`, `SD_CLASS_DISPLAY` dengan tone, `IMMUNIZATION_STATUS_LABEL`, `MILESTONE_STATUS_LABEL`, `MILESTONE_DOMAIN_LABEL`).
- `src/application/health-plan/use-cases/upsert-child-immunization.ts` & `upsert-child-milestone.ts` — use case mutasi ceklis (mengonsumsi repository `child_immunizations` / `child_milestones`). Composition root `src/composition/index.ts` mendaftarkan `upsertChildImmunization` & `upsertChildMilestone`.
- `src/schemas/health-plan.ts` — `upsertChildImmunizationInputSchema` (status `pending|done|skipped`, `givenAt: dateOnlySchema.nullable()`, `note` max 500), `upsertChildMilestoneInputSchema` (status `not_checked|achieved|delayed`, `checkedAt: dateOnlySchema.nullable()`, `note` max 500). Output: `Result<ChildImmunizationDto, AppError>` / `Result<ChildMilestoneDto, AppError>`.

**UI primitives baru / yang dikonsumsi:**

- `FeedbackBanner` (success/error tone) — banner status form.
- `Badge` tones digunakan untuk SD class display via `SD_CLASS_DISPLAY[sdClass].tone`.
- `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` membungkus form & history tables.

**Routing & UI (semua mengkonsumsi `@/config/tracker`):**

- `src/app/(app)/tracker/page.tsx` — Server Component, `force-dynamic`. `requireServerSession` → `fetchChildrenByOwner(userId)`. Grid `ChildCard` + CTA `<Link>` ke `/tracker/anak/baru`. State triplet via `EmptyState` (belum ada anak) / `ErrorState` (gagal fetch).
- `src/app/(app)/tracker/loading.tsx` — Skeleton list.
- `src/app/(app)/tracker/anak/baru/page.tsx` — Server Component, `force-dynamic`. Membungkus `<AddChildForm />` dalam `Card`. Setelah berhasil, action redirect ke `/tracker/anak/[childId]`.
- `src/components/features/tracker/add-child-form.tsx` — Client, `useActionState(createChild, …)`. Inputs: nama, jenis kelamin (`L`/`P`), tanggal lahir (required); berat lahir, panjang lahir, usia kehamilan, catatan (opsional). Field-level error via `errorMessage` + general `FeedbackBanner` saat `message` tanpa `fieldErrors`. Tombol `SubmitButton` pakai `useFormStatus().pending`.
- `src/app/(app)/tracker/anak/[childId]/layout.tsx` — Server Component. `requireServerSession` → `fetchChildById(userId, childId)`; `NotFoundError` → `notFound()` → `not-found.tsx`. Render `ChildDetailHeader` + `ChildNav` (Ringkasan/Pengukuran/Imunisasi/Perkembangan, `aria-current="page"`).
- `src/app/(app)/tracker/anak/[childId]/page.tsx` — Ringkasan: `ChildSummary` (kartu per indikator dengan nilai terakhir + z-score + SD badge) + `GrowthChartCard` (dynamic-imported `GrowthChart` dengan Skeleton fallback).
- `src/app/(app)/tracker/anak/[childId]/error.tsx` & `not-found.tsx` — fallback Bahasa Indonesia dengan tombol kembali.
- `src/components/features/tracker/growth-chart.tsx` — Client, Recharts `LineChart` z-score vs usia (bulan), `<ReferenceLine>` di ±2, ±3, 0 (acuan WHO), `<Select>` pemilih indikator (BB/U, TB/U, BB/TB, LK/U). `ResponsiveContainer`.
- `src/components/features/tracker/growth-chart-card.tsx` — `Card` wrapper + `dynamic(() => import("./growth-chart"), { ssr: false, loading: <Skeleton/> })` agar 200KB+ Recharts tidak dibebani ke initial bundle Server route.
- `src/components/features/tracker/child-summary.tsx` — Ringkasan per indikator: ambil pengukuran terakhir yang memiliki z-score per indikator, render `Badge` SD class + nilai mentah. Empty state dengan tombol "Tambah pengukuran".
- `src/app/(app)/tracker/anak/[childId]/pengukuran/page.tsx` — `Promise.all([requireServerSession, fetchMeasurementsByChild])`. Dua `Card`: `MeasurementForm` (input pengukuran) + `MeasurementHistory` (urut reverse-chronological).
- `src/components/features/tracker/measurement-form.tsx` — Client, `useActionState(addMeasurement.bind(null, childId), …)`. Field: `measuredAt` (required, default today ISO), `weightKg`, `heightCm`, `measuredLying` (standing/lying), `headCircumferenceCm`, `muacCm`, `note`. Server-side refine memastikan minimal satu kolom numerik diisi. Pada `state.ok` form di-reset via `ref.current?.reset()` + `FeedbackBanner` success.
- `src/components/features/tracker/measurement-history.tsx` — Card list `<ul>` urut `measuredAt` DESC. Tiap item: tanggal, kolom nilai dengan unit (`kg`/`cm`) atau `-` jika null, chip `z = X.XX` per indikator yang ada z-score, badge SD class via `SD_CLASS_DISPLAY`, catatan opsional. Empty state dengan `MEASUREMENTS_COPY.emptyTitle`.
- `src/app/(app)/tracker/anak/[childId]/imunisasi/page.tsx` — `Promise.all([fetchImmunizationSchedule, fetchChildImmunizations])` → `ImmunizationChecklist`.
- `src/components/features/tracker/immunization-checklist.tsx` — Client. Pola per-row: `boundAction = upsertChildImmunization.bind(null, childId, item.code)` → `useActionState(boundAction, INITIAL_UPSERT_IMMUNIZATION_STATE)` di dalam komponen `ImmunizationRow`. Input field per-row hydrate dari `state?.record?.status ?? record?.status ?? "pending"` (analog untuk `givenAt`, `note`). `RowSubmit` memakai `useFormStatus()` untuk label "Menyimpan..." / "Tersimpan" (saat ok) / "Simpan". Tampilan: kartu list dengan label kode + nama imunisasi, badge dose (jika ada), label rekomendasi usia, status select, date input, textarea catatan.
- `src/app/(app)/tracker/anak/[childId]/perkembangan/page.tsx` — `Promise.all([fetchMilestoneCatalog, fetchChildMilestones])` → `MilestoneChecklist`.
- `src/components/features/tracker/milestone-checklist.tsx` — Client. `useMemo` untuk indeks `byMilestoneId` & grouping `byDomain` (`gross_motor`/`fine_motor`/`language`/`social`, urut `minAgeMonths` lalu `displayOrder`). Heading `<h2>` per domain dengan `MILESTONE_DOMAIN_LABEL`. Setiap row punya `useActionState` sendiri (`upsertChildMilestone.bind(null, childId, milestone.id)`). Status badge dengan tone: `achieved` → success, `delayed` → warning, lainnya → neutral.

**Server Actions (semua di `src/app/(app)/tracker/.../actions.ts`):**

- `createChild(_previous, formData)` — Zod parse, panggil `createChild` use case, `revalidateTag(childrenTag(userId))`, lalu `redirect(trackerChildRoute(child.id))`.
- `addMeasurement(childId, _previous, formData)` — Zod parse (semua field numerik nullable), `addMeasurement` use case, `revalidateTag(measurementsTag(childId))` + `revalidateTag(childTag(childId))`. Mengembalikan `AddMeasurementFormState { ok, message?, fieldErrors? }`.
- `upsertChildImmunization(childId, immunizationCode, _previous, formData)` — `revalidateTag(immunizationsTag(childId)) + revalidateTag(childTag(childId))`. Mengembalikan `UpsertImmunizationFormState { ok, message?, fieldErrors?, record? }`.
- `upsertChildMilestone(childId, milestoneId, _previous, formData)` — `revalidateTag(milestonesTag(childId)) + revalidateTag(childTag(childId))`. Mengembalikan `UpsertMilestoneFormState { ok, message?, fieldErrors?, record? }`.

**State triplet (project guidelines §11):**

- Loading: `loading.tsx` per route group (`/tracker`, `/tracker/anak/[childId]`, `/tracker/anak/[childId]/pengukuran`, `/imunisasi`, `/perkembangan`, `/tracker/anak/baru`), skeleton mirror layout produksi.
- Error: `error.tsx` di `/tracker/anak/[childId]`; fetch yang menghasilkan `Result.err` di Server Component dirender lewat `<ErrorState>` dengan title spesifik (`TRACKER_LIST_COPY.errorTitle`, `MEASUREMENTS_COPY.errorTitle`, `IMMUNIZATION_COPY.errorTitle`, `MILESTONE_COPY.errorTitle`).
- Empty: `<EmptyState>` (list anak kosong, riwayat pengukuran kosong, jadwal imunisasi kosong, milestone kosong).
- Not found: `not-found.tsx` di `/tracker/anak/[childId]` saat `fetchChildById` mengembalikan `NotFoundError` (id valid UUID tapi bukan milik user / sudah soft-deleted) atau saat `params.childId` bukan UUID (`isUuid` guard di setiap leaf page).

**Caching & invalidasi (mengikuti §5.2):**

- Semua route tracker `dynamic` (data per-user, RLS owner-only — tidak boleh di-ISR).
- React `cache()` di lib helper mendedup pemanggilan dalam satu request (mis. layout + page yang sama-sama butuh `fetchChildById`).
- Mutator memanggil `revalidateTag(tag, "max")` untuk semua tag terdampak.
- Tag katalog (`catalog:immunization-schedule`, `catalog:milestones`) di-revalidate hanya oleh admin path (Stage 5+); untuk MVP katalog cukup di-seed sekali.

**Performance & responsiveness:**

- Recharts (≈200 KB) di-dynamic-import dengan `ssr: false`; hanya route `/tracker/anak/[childId]` (ringkasan) yang membayar bundle ini, dan hanya setelah hydration.
- Semua sub-route lain Server-rendered penuh; Client Components dibatasi pada form (form harus `"use client"` untuk `useActionState` + `useFormStatus`) dan checklist (binding per-row).
- Grid kartu `/tracker`: `sm:grid-cols-2 xl:grid-cols-3`.
- Form grid: `md:grid-cols-2` (single-column di mobile 360px tanpa horizontal scroll).
- Touch target: `Button`/`Input`/`Select` primitif memenuhi 44px (lihat `src/components/primitives`).
- Tabel history & checklist memakai `<ul>`/`<li>` semantik, bukan tabel HTML — lebih ramah responsive di mobile.

**Aksesibilitas (WCAG 2.1 AA):**

- Heading hierarchy: `h1` PageHeader → `h2` per Card section (CardTitle).
- Setiap input form punya `<Label htmlFor>` + `id` (via `useId()`), `required` ditandai dengan asterisk + sr-only " wajib diisi".
- Setiap field error dikaitkan via `aria-describedby` otomatis (built-in `Input`/`Select`/`Textarea`).
- `FeedbackBanner role="alert"` saat error, `role="status"` saat success.
- `ChildNav` link aktif memakai `aria-current="page"`.
- Tabel z-score chip & SD badge memakai teks (bukan warna saja) untuk menyampaikan klasifikasi.

**Test (Stage 4 Tracker):**

- `src/config/tracker.test.ts` (pre-existing) — sanity kontrak label maps.
- Component tests (`src/components/features/tracker/*.test.tsx`): 8 file, **36 case hijau**:
  - `sd-class-badge.test.tsx` (3)
  - `child-card.test.tsx` (6)
  - `child-summary.test.tsx` (4)
  - `measurement-history.test.tsx` (6)
  - `add-child-form.test.tsx` (4)
  - `measurement-form.test.tsx` (4)
  - `immunization-checklist.test.tsx` (4)
  - `milestone-checklist.test.tsx` (5)
- Use case tests untuk z-score & SD classification sudah ada (`src/domain/tracking/services/z-score-calculator.test.ts`, `src/domain/tracking/value-objects/sd-classification.test.ts`).
- E2E `tests/e2e/tracker.spec.ts`: anonymous-guard untuk 6 route tracker + responsive overflow check di 360/768/1440. Happy-path autentikasi di-defer (konsisten dengan §10e/§10f/§10g) hingga fixture user uji ter-seed.

**Yang sengaja DITUNDA:**

- Halaman admin CRUD `immunization_schedule` & `milestones` (Stage 5+).
- Soft delete anak dari UI (use case `softDeleteChild` sudah ada di backend; CTA dihilangkan dari MVP untuk menghindari kebingungan user).
- Edit pengukuran (history saat ini read-only; user mengoreksi via tambah pengukuran baru).
- Export PDF Buku KIA mini per anak (Stage 5+).
- E2E happy-path penuh (sign-in fixture → tambah anak → tambah pengukuran → toggle imunisasi → toggle milestone) di-defer hingga fixture user uji tersedia.

**Verifikasi yang masih wajib manual sebelum DoD §24:**

- Sweep responsif 360/768/1440 px + Slow 3G + Low-end CPU pada sesi sign-in nyata.
- Lighthouse mobile pada keempat sub-route tracker setelah preview deployment.
- axe-core scan via CI preview.

---

## 11. Keputusan Arsitektural Terkait

- [ADR-0001 — Arsitektur empat lapis, OOP, dan Migration Sequence Protocol](adr/0001-arsitektur.md)
- [ADR-0002 — Renderer peta: SVG choropleth hand-rolled, bukan MapLibre/Leaflet](adr/0002-map-renderer.md)

---

## 12. Asumsi Eksplisit (sudah disetujui user)

1. **Lokalisasi**: UI Bahasa Indonesia, kode/komentar Bahasa Inggris (sesuai project guidelines §23.13).
2. **Tahun map**: hanya 2021-2024 di MVP. Bila ada data baru, cukup tambah ke
   `region_indicators` — UI otomatis menyesuaikan rentang slider.
3. **Sex anak**: disimpan biner `L`/`P` karena WHO LMS dan Buku KIA tidak menyediakan
   referensi non-biner. Bila perlu nuansa identitas, ditambahkan di profil non-medis.
4. **Akses publik vs login**: hanya landing & auth yang publik. Map & seterusnya butuh
   login (sesuai build-plan Bagian 2). Bila Map ingin dibuka publik di kemudian hari,
   tabel referensi sudah mendukung tanpa migrasi.
5. **Library peta**: tidak ada library peta runtime. Choropleth dirender sebagai
   SVG server-side via projector equirectangular sendiri (`src/lib/geo/projection.ts`).
   Lihat ADR-0002 untuk pertimbangan vs MapLibre/Leaflet/d3-geo.
6. **PostGIS**: tidak diaktifkan di MVP; geometri disimpan sebagai `jsonb` GeoJSON.
7. **Skor what-if**: butuh `model_coefficients` dari R. Jika belum tersedia, halaman
   `/dashboard/what-if` menampilkan empty state instruksional, bukan disembunyikan.
8. **Default landing setelah login**: `/map` (peta nasional sebagai jendela utama).
9. **Tema (light/dark)**: preferensi disimpan di `profiles.theme_preference`
   (`system`/`light`/`dark`); fallback awal sebelum profil dimuat = `system`.
10. **Role admin**: ada sejak Stage 2. Tabel `profiles` mendapat kolom `role`
    (`user`/`admin`). Admin dapat mengelola `education_articles`, `immunization_schedule`,
    `milestones`, `indicator_dictionary`, `model_metadata`, dan mem-trigger ulang skrip
    import. RLS: tabel publik tetap read-only untuk authenticated; tambahan policy
    `WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'))`
    untuk INSERT/UPDATE/DELETE.
