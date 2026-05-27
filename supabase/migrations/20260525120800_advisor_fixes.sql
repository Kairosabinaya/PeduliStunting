-- Follow-up migration addressing Supabase advisors after the initial schema.
-- Three classes of fix:
--   1. SECURITY DEFINER functions must not be callable by anon/authenticated
--      via PostgREST (they are infrastructure helpers only).
--   2. Foreign key columns lacking covering indexes hurt join + RLS plans.
--   3. PUB-R tables had FOR ALL admin policies overlapping FOR SELECT read
--      policies, which the planner treats as "multiple permissive policies"
--      and re-evaluates per row. Split admin write into explicit
--      INSERT/UPDATE/DELETE so SELECT only matches the read policy.

-- 1. Lock down SECURITY DEFINER helpers.
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 2. Covering indexes for foreign keys.
CREATE INDEX IF NOT EXISTS child_immunizations_user_idx
  ON public.child_immunizations (user_id);
CREATE INDEX IF NOT EXISTS child_immunizations_code_idx
  ON public.child_immunizations (immunization_code);
CREATE INDEX IF NOT EXISTS child_milestones_user_idx
  ON public.child_milestones (user_id);
CREATE INDEX IF NOT EXISTS child_milestones_milestone_idx
  ON public.child_milestones (milestone_id);
CREATE INDEX IF NOT EXISTS growth_measurements_user_idx
  ON public.growth_measurements (user_id);
CREATE INDEX IF NOT EXISTS model_coefficients_region_idx
  ON public.model_coefficients (kode_bps);
CREATE INDEX IF NOT EXISTS model_coefficients_predictor_idx
  ON public.model_coefficients (predictor_code);
CREATE INDEX IF NOT EXISTS model_predictions_region_idx
  ON public.model_predictions (kode_bps);

-- 3. Split admin FOR ALL policies into INSERT/UPDATE/DELETE for every PUB-R
--    table. SELECT stays governed by the existing *_read policy.
DROP POLICY IF EXISTS regions_admin_write ON public.regions;
CREATE POLICY regions_admin_insert ON public.regions
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY regions_admin_update ON public.regions
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY regions_admin_delete ON public.regions
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS region_boundaries_admin_write ON public.region_boundaries;
CREATE POLICY region_boundaries_admin_insert ON public.region_boundaries
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY region_boundaries_admin_update ON public.region_boundaries
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY region_boundaries_admin_delete ON public.region_boundaries
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS indicator_dictionary_admin_write ON public.indicator_dictionary;
CREATE POLICY indicator_dictionary_admin_insert ON public.indicator_dictionary
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY indicator_dictionary_admin_update ON public.indicator_dictionary
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY indicator_dictionary_admin_delete ON public.indicator_dictionary
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS region_indicators_admin_write ON public.region_indicators;
CREATE POLICY region_indicators_admin_insert ON public.region_indicators
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY region_indicators_admin_update ON public.region_indicators
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY region_indicators_admin_delete ON public.region_indicators
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS model_metadata_admin_write ON public.model_metadata;
CREATE POLICY model_metadata_admin_insert ON public.model_metadata
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY model_metadata_admin_update ON public.model_metadata
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY model_metadata_admin_delete ON public.model_metadata
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS model_predictions_admin_write ON public.model_predictions;
CREATE POLICY model_predictions_admin_insert ON public.model_predictions
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY model_predictions_admin_update ON public.model_predictions
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY model_predictions_admin_delete ON public.model_predictions
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS model_coefficients_admin_write ON public.model_coefficients;
CREATE POLICY model_coefficients_admin_insert ON public.model_coefficients
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY model_coefficients_admin_update ON public.model_coefficients
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY model_coefficients_admin_delete ON public.model_coefficients
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS education_articles_admin_write ON public.education_articles;
CREATE POLICY education_articles_admin_insert ON public.education_articles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY education_articles_admin_update ON public.education_articles
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY education_articles_admin_delete ON public.education_articles
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS growth_standards_admin_write ON public.growth_standards;
CREATE POLICY growth_standards_admin_insert ON public.growth_standards
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY growth_standards_admin_update ON public.growth_standards
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY growth_standards_admin_delete ON public.growth_standards
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS immunization_schedule_admin_write ON public.immunization_schedule;
CREATE POLICY immunization_schedule_admin_insert ON public.immunization_schedule
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY immunization_schedule_admin_update ON public.immunization_schedule
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY immunization_schedule_admin_delete ON public.immunization_schedule
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS milestones_admin_write ON public.milestones;
CREATE POLICY milestones_admin_insert ON public.milestones
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY milestones_admin_update ON public.milestones
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY milestones_admin_delete ON public.milestones
  FOR DELETE TO authenticated USING (public.is_admin());
