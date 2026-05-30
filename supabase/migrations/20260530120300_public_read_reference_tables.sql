-- Grant anonymous SELECT on the public reference tables so /dashboard and /map
-- render real data for logged-out visitors (thesis examiners + the public).
--
-- These tables hold published BPS/SSGI statistics, region boundaries, and model
-- research output -- no PII. User-owned tables (children, growth_measurements,
-- pregnancies, profiles, ...) are deliberately NOT touched and keep their
-- owner-only RLS.
--
-- The read policies are named `<table>_read` in the live database; this
-- migration drops and recreates each with `TO anon, authenticated`. Idempotent
-- via DROP POLICY IF EXISTS.
--
-- Reverse: recreate each policy with `FOR SELECT TO authenticated USING (true)`.

DROP POLICY IF EXISTS regions_read ON public.regions;
CREATE POLICY regions_read ON public.regions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS region_boundaries_read ON public.region_boundaries;
CREATE POLICY region_boundaries_read ON public.region_boundaries
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS region_indicators_read ON public.region_indicators;
CREATE POLICY region_indicators_read ON public.region_indicators
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS indicator_dictionary_read ON public.indicator_dictionary;
CREATE POLICY indicator_dictionary_read ON public.indicator_dictionary
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS model_metadata_read ON public.model_metadata;
CREATE POLICY model_metadata_read ON public.model_metadata
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS model_predictions_read ON public.model_predictions;
CREATE POLICY model_predictions_read ON public.model_predictions
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS model_coefficients_read ON public.model_coefficients;
CREATE POLICY model_coefficients_read ON public.model_coefficients
  FOR SELECT TO anon, authenticated USING (true);
