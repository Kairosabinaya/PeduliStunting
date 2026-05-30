-- Extend indicator_dictionary with the standardization recipe + predictor
-- statistics the GTWENOLR local predictor and the /dashboard analysis need.
--
-- All columns are nullable so the existing rows (Y, Y1, X1..X20) stay valid
-- until `pnpm import:dashboard` backfills X1..X20 from predictor_meta.csv.
--
-- The research brief groups the 20 predictors by a 6-label dimension
-- vocabulary that differs from the import-pipeline taxonomy stored in
-- `dimension` (outcome/socioeconomic/health_service/...). `model_dimension`
-- carries the brief's grouping verbatim WITHOUT altering the existing
-- `dimension` CHECK, which `scripts/import-indicators.ts` depends on.
--
-- `display_order` (1..20) makes the X1..X20 ordering explicit and queryable, so
-- the positional alignment beta{k} <-> X{k} <-> predictor never relies on a
-- string sort (which would place X10 before X2).
--
-- Reverse: ALTER TABLE public.indicator_dictionary DROP COLUMN <each>.

ALTER TABLE public.indicator_dictionary
  ADD COLUMN transform text
    CHECK (transform IS NULL OR transform IN ('none', 'log', 'log1p')),
  ADD COLUMN std_mean numeric,
  ADD COLUMN std_sd numeric,
  ADD COLUMN orig_min numeric,
  ADD COLUMN orig_max numeric,
  ADD COLUMN orig_p5 numeric,
  ADD COLUMN orig_p50 numeric,
  ADD COLUMN orig_p95 numeric,
  ADD COLUMN pct_active numeric,
  ADD COLUMN pct_positive numeric,
  ADD COLUMN median_coef numeric,
  ADD COLUMN cor_prevalence numeric,
  ADD COLUMN model_dimension text
    CHECK (model_dimension IS NULL OR model_dimension IN (
      'Sosial-Ekonomi', 'Pendidikan', 'Kesehatan',
      'Ketahanan Pangan', 'Konsumsi Pangan', 'Gender'
    )),
  ADD COLUMN display_order smallint
    CHECK (display_order IS NULL OR display_order BETWEEN 1 AND 99);
