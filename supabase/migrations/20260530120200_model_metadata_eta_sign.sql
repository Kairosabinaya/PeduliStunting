-- model_metadata.eta_sign: the GTWENOLR linear-predictor sign convention used
-- by the local predictor (eta = eta_sign * sum(beta_k * x_std_k)). It is a
-- scalar consumed in a numeric hot path, so it is a typed column rather than a
-- free-form value buried in the `metrics` jsonb.
--
-- The baseline-model comparison (OLR/ENOLR/GWOLR/GTWOLR/GTWENOLR_tetap/
-- GTWENOLR_adaptif) stays inside `metrics` jsonb under `metrics.baselines`,
-- mirroring how `metrics.models` is already read by the dashboard.
--
-- Reverse: ALTER TABLE public.model_metadata DROP COLUMN eta_sign.

ALTER TABLE public.model_metadata
  ADD COLUMN eta_sign smallint NOT NULL DEFAULT 1
    CHECK (eta_sign IN (-1, 1));
