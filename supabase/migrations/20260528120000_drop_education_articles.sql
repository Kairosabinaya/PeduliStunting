-- Drop `education_articles` table along with its indexes, trigger, and
-- RLS policies. Halaman `/edukasi` di-rewrite menjadi scrollytelling
-- longform berbasis konten statis (lihat docs/adr/0007-edukasi-scrollytelling.md).
--
-- Reversibility: re-run migrations `20260525120500_education.sql` (schema)
-- and `20260525120900_education_seed.sql` (seed) to restore the previous
-- shape. Konten 16 artikel KIA tetap hidup sebagai data statis di
-- `src/data/edukasi/` untuk dipakai ACT 6 di Phase 2.

DROP TABLE IF EXISTS public.education_articles CASCADE;
