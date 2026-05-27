# ADR-0001 — Arsitektur empat lapis, OOP, dan Migration Sequence Protocol

- **Status:** Accepted
- **Tanggal:** 2026-05-25
- **Author:** Kairos Abinaya Susanto
- **Konteks:** Stage 0 (perancangan awal Peduli Stunting).

## Konteks

Peduli Stunting adalah aplikasi web Next.js + Supabase dengan empat fitur berdampak
luas (Map nasional, Edukasi, Tracker pertumbuhan personal, Dashboard model GTWENOLR)
dan target performa tinggi pada perangkat menengah-bawah. Aplikasi ini bersifat
produksi untuk pengguna nyata dan akan dikerjakan secara iteratif, kemungkinan oleh
beberapa agen (manusia dan AI) secara paralel.

Kondisi yang harus diakomodasi sejak awal:

1. **Data ganda**: dataset peneliti (Dataset.xlsx) yang besar dan jarang berubah, plus
   data milik user (anak, pengukuran) yang sering berubah dan harus dilindungi RLS.
2. **Rantai sumber tunggal**: skema DB, tipe TS, validator Zod, repository, use case,
   dan UI rawan drift jika dibangun ad-hoc. Bug klasik "halaman A pakai `field_a`,
   halaman B pakai `field_a_`" wajib dicegah.
3. **Domain memiliki invariant non-trivial**: Z-score WHO LMS, klasifikasi SD per
   indikator, kategori ordinal stunting. Logika ini harus dapat diuji murni tanpa
   menyalakan DB atau Next.js.
4. **Operasi paralel**: beberapa agen bekerja bersamaan; mereka butuh kontrak yang
   sama dan satu titik kebenaran (STATE.md + GLOSSARY.md + ADR).
5. **project guidelines** sudah menetapkan empat lapis (`domain ← application ← {infrastructure, presentation}`)
   sebagai ruleset wajib. ADR ini menerjemahkannya untuk konteks Peduli Stunting.

## Keputusan

### 1. Empat lapis dengan dependensi mengalir ke dalam

```
presentation (Next.js RSC, Server Action, components)
        │
        ▼
application (Use cases, DTO)
        │
        ▼
domain (Entity, VO, Domain Service, Port, Error, Result)
        ▲
        │ mengimplementasikan port
infrastructure (Supabase repo, WHO calculator factory, Sentry, Pino, Storage)
```

- Domain TIDAK boleh mengimpor `next/*`, `@supabase/*`, atau library IO mana pun.
- Application hanya bergantung pada Domain (port) plus tipe utilitas dari shared.
- Infrastructure mengimplementasikan port Domain.
- Presentation memanggil use case via composition root `/src/composition/`.

### 2. Bounded contexts

Tujuh konteks: `region`, `model`, `education`, `tracking`, `health-plan`, `account`,
`shared`. Setiap konteks punya sub-folder di tiap lapis. Lintasan import antar konteks
diperbolehkan HANYA via `shared` atau via interface domain yang eksplisit (tidak
mengimpor entity konteks lain langsung dari presentation).

### 3. OOP-oriented dengan Result<T, E>

- Entity, value object, domain service, dan use case dibangun sebagai class TypeScript
  dengan single responsibility.
- Konstruktor menerima dependency melalui parameter (constructor injection).
- Operasi yang bisa gagal mengembalikan `Result<T, AppError>` (lihat project guidelines §12 +
  GLOSSARY.md). Exception TIDAK menyeberang batas lapisan.
- Plain function dipakai hanya untuk utilitas stateless (mis. `clamp`, formatter).

### 4. Repository pattern + use case pattern

- Setiap akses data via Repository (interface di `domain/ports/`, implementasi di
  `infrastructure/supabase/`).
- Setiap operasi presentation memanggil EXACTLY satu use case (kecuali query baca
  kompleks yang dipecah jadi beberapa repository call di satu use case komposit).
- Server Action TIDAK memanggil Supabase langsung.

### 5. Single Source of Truth Chain (project guidelines §4)

Diberlakukan tanpa pengecualian:

```
migration -> generated TS types -> Zod schemas (extend) -> repository port + impl ->
use case -> Server Action / RSC -> STATE.md updated -> GLOSSARY.md updated (jika perlu)
```

Konsekuensi:
- Tipe TS tidak ditulis manual jika sudah ada dari Supabase generator. Extend / compose.
- Zod schema yang menggambarkan baris DB di-derive dari tipe generated.
- Nama kolom DB direferensikan via `keyof Row` di repository, BUKAN string literal yang
  dapat dikomposisi salah.
- Konstanta enum hidup di satu file per kategori (mis. `constants/stunting-category.ts`).

### 6. Migration Sequence Protocol (project guidelines §8) dijadikan checklist PR

Setiap perubahan skema WAJIB:
1. Migration reversible di `/supabase/migrations/`.
2. Regenerate types (`pnpm supabase:gen-types`) dan commit.
3. Update Zod.
4. Update port (jika bentuk berubah dari sisi domain).
5. Update implementasi repository.
6. Update use case.
7. Update presentation.
8. Update STATE.md.
9. Update GLOSSARY.md jika ada istilah baru.
10. Tambah/ubah test di semua lapisan terdampak.

PR yang melewatkan langkah ditolak. Aturan ini juga mengunci paralelisme: dua agen
yang masing-masing mengubah kolom yang sama akan terdeteksi sebagai konflik migration,
bukan sebagai bug semantik di UI.

### 7. RLS-first: data publik vs data user

- Tabel referensi/publik (`regions`, `region_boundaries`, `indicator_dictionary`,
  `region_indicators`, `model_*`, `growth_standards`, `education_articles`,
  `immunization_schedule`, `milestones`) memakai policy SELECT untuk `authenticated`,
  tanpa policy INSERT/UPDATE/DELETE. Mutasi hanya lewat service role di skrip import.
- Tabel user (`profiles`, `children`, `growth_measurements`, `child_immunizations`,
  `child_milestones`) memakai policy `auth.uid() = user_id` untuk ALL.
- Service role key hanya muncul di skrip server-only yang terisolasi (`scripts/`),
  tidak diimpor dari aplikasi Next.js. Path ini di-justifikasi di ADR ini.
- Test RLS dengan `pgtap` di `/supabase/tests/`, dijalankan di CI.

### 8. Penanganan dataset 540 vs 514 region

Dataset memuat 540 kab/kota; model GTWENOLR di Bab4 menggunakan 514 (panel tidak
seimbang, antara lain karena pemekaran Papua). Skrip import menyimpan keduanya apa
adanya:
- `regions` dan `region_indicators` lengkap (540 kab/kota per tahun tersedia).
- `model_predictions` hanya untuk region yang memiliki prediksi.
- UI peta menampilkan empty state ("Prediksi model belum tersedia") untuk region
  yang tidak memiliki baris di `model_predictions`, tanpa mengubah penampilan
  warna prevalensi resmi (Y/Y1).

Pendekatan ini menghormati integritas penelitian dan menghindari rekonstruksi data
yang tidak dimiliki.

### 9. Caching tag-based, bukan path-based

Setiap fetch yang berasal dari DB di-bungkus tagged cache (`unstable_cache` atau
`fetch` dengan `next.tags`). Setiap Server Action mutator memanggil `revalidateTag`
dengan tag spesifik (bukan `revalidatePath` luas). Konvensi tag tercatat di STATE.md
§5.3.

### 10. Geometri batas wilayah sebagai GeoJSON `jsonb`, bukan PostGIS

Untuk MVP, batas wilayah disimpan sebagai GeoJSON tersederhanakan di kolom `jsonb`.
Alasan: query spasial dilakukan di klien peta, bukan di DB; menambah PostGIS menaikkan
biaya operasional dan kompleksitas migration tanpa manfaat. Bila kelak butuh filter
spasial server-side (mis. cari region terdekat dari koordinat user), ADR baru akan
mengaktifkan PostGIS dan migrate.

### 11. Lokalisasi: UI Bahasa Indonesia, kode Bahasa Inggris

UI label, copy, dan error message untuk end-user dalam Bahasa Indonesia. Kode,
komentar, JSDoc, dan dokumentasi developer dalam Bahasa Inggris. Mengikuti
project guidelines §23.13. Tabel referensi (mis. `education_articles`) menyimpan teks
Indonesia karena memang konten edukasi untuk publik Indonesia.

## Alternatif yang dipertimbangkan

### A. "Pragmatic Next.js": tanpa lapisan domain terpisah

Pola umum komunitas Next.js: Server Action langsung memanggil Supabase, validasi Zod
inline, logika di file route. Lebih cepat di awal, lebih mudah dibaca pemula.

Ditolak karena:
- Tracker punya invariant non-trivial (WHO LMS, klasifikasi SD) yang akan tersebar
  di banyak route bila tidak diisolasi.
- Beberapa agen paralel akan menulis duplikat logika yang berbeda halus.
- Sulit di-test tanpa menyalakan DB / Next.js runtime.

### B. Tanpa kelas, hanya function modules (FP-lite)

Modular tetapi tanpa OOP. Lebih ringkas untuk utilitas.

Ditolak karena project guidelines §2.16 secara eksplisit menetapkan OOP-oriented domain.
Use case sebagai class memudahkan composition root dan testing dengan stub.

### C. PostGIS sejak awal

Memungkinkan query spasial yang ekspresif.

Ditolak untuk MVP: tidak ada use case server-side yang membutuhkannya saat ini, dan
PostGIS menambah kompleksitas migration & RLS yang tidak sebanding.

### D. Skema "wide" untuk indikator (kolom dinamis per X)

Membuat skema lebih ringkas dengan join ke `indicator_dictionary` saja.

Ditolak: 20 prediktor stabil di seluruh dataset dan disebut langsung di model. Kolom
`x1..x20` lebih sederhana di-query, lebih cepat di-import, dan mencegah kompleksitas
pivot. Metadata setiap kolom tetap hidup di `indicator_dictionary` agar UI tidak
hardcode nama.

## Konsekuensi

### Positif
- Logika domain terisolasi dan dapat di-test sebagai pure TS.
- Drift antar lapisan dicegah oleh Migration Sequence Protocol.
- Paralelisasi agen aman karena kontrak (port + skema + STATE.md) menjadi titik
  sinkronisasi.
- RLS-first menghilangkan kelas bug "data user A bocor ke user B".
- Tag-based caching menghasilkan revalidasi tepat sasaran, mengurangi over-revalidate.

### Negatif (diterima)
- Overhead awal: lebih banyak file per fitur (port, impl, use case, DTO, schema).
- Kurva belajar untuk kontributor baru yang terbiasa "Server Action → Supabase".
- Diperlukan disiplin dokumentasi (STATE.md, GLOSSARY.md, ADR) setiap PR.

## Kepatuhan terhadap project guidelines

ADR ini mengikuti, tidak mengubah, aturan berikut:
- §1 Locked tech stack
- §2 Core non-negotiables (no `any`, no hardcode, no magic Tailwind, no emoji, dst.)
- §3 SOLID dan Clean Layering
- §4 Single Source of Truth Chain
- §6 Security (RLS, validasi boundary, secrets)
- §8 Migration Sequence Protocol
- §11 State triplet loading/error/empty
- §12 Error taxonomy
- §13 Caching strategy

## Tindak lanjut

- Stage 1 (scaffold) mengeksekusi struktur folder berdasar ADR ini.
- Stage 2 (backend) menerapkan Migration Sequence Protocol pada semua tabel di
  STATE.md §4.
- ADR baru WAJIB ditulis bila ada perubahan: pemilihan library peta, aktivasi PostGIS,
  perubahan strategi caching utama, atau perpindahan dari Supabase.
