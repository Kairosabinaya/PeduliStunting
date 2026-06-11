-- Drop tables for removed/deactivated features so the schema only carries
-- what the active app uses (project guidelines §8, §22).
--
-- Removed features:
--   * pregnancies            -> "Kehamilan" (Tracker Phase 6) feature code was
--   * pregnancy_events          already removed from src/; only orphaned tables
--                               and generated types remained.
--   * child_nutrition_events -> "Gizi" (Tracker Phase 5) feature deactivated;
--                               its code is removed in the same change.
--
-- Note: education_articles was already dropped earlier in
-- 20260528120000_drop_education_articles.sql, so it is not repeated here.
--
-- CASCADE drops the dependent policies, indexes, triggers, and the
-- pregnancy_events -> pregnancies FK. No retained table references these.
--
-- Reversibility: re-run the original create migrations to restore the shapes
--   (nutrition -> 20260529120300_nutrition.sql,
--    pregnancy -> 20260529120400_pregnancy.sql).

DROP TABLE IF EXISTS public.child_nutrition_events CASCADE;
DROP TABLE IF EXISTS public.pregnancy_events CASCADE;
DROP TABLE IF EXISTS public.pregnancies CASCADE;
