-- Tracker Phase 0:
-- Adds a `prevents` column to `immunization_schedule` so the tracker UI can
-- surface the educational "vaksin ini mencegah apa" tooltip without hard-coding
-- the text in the React layer. Backfilled by the next seed migration.

ALTER TABLE public.immunization_schedule
  ADD COLUMN prevents text;

COMMENT ON COLUMN public.immunization_schedule.prevents IS
  'Plain-language description of the diseases this vaccine prevents. Source: Buku KIA 2024 hal. 124-125.';
