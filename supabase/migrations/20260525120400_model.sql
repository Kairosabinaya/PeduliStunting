-- model_metadata: catalog of fitted model versions (default GTWENOLR-adaptive).
-- model_predictions: per (kode_bps, tahun, version) ordinal class + class probabilities.
-- model_coefficients: optional per-location coefficients for what-if simulation.

CREATE TABLE public.model_metadata (
  version text PRIMARY KEY,
  name text NOT NULL,
  hyperparameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  moran_per_year jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Partial unique index so at most one row may be flagged default.
CREATE UNIQUE INDEX model_metadata_one_default_idx
  ON public.model_metadata ((true))
  WHERE is_default;

CREATE TRIGGER model_metadata_set_updated_at
  BEFORE UPDATE ON public.model_metadata
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.model_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY model_metadata_read ON public.model_metadata
  FOR SELECT TO authenticated USING (true);

CREATE POLICY model_metadata_admin_write ON public.model_metadata
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE public.model_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL
    REFERENCES public.model_metadata(version) ON DELETE CASCADE,
  kode_bps text NOT NULL
    REFERENCES public.regions(kode_bps) ON DELETE CASCADE,
  tahun smallint NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
  predicted_category text NOT NULL
    CHECK (predicted_category IN ('Rendah', 'Sedang', 'Tinggi')),
  prob_rendah numeric(7, 6) CHECK (prob_rendah IS NULL OR prob_rendah BETWEEN 0 AND 1),
  prob_sedang numeric(7, 6) CHECK (prob_sedang IS NULL OR prob_sedang BETWEEN 0 AND 1),
  prob_tinggi numeric(7, 6) CHECK (prob_tinggi IS NULL OR prob_tinggi BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (model_version, kode_bps, tahun)
);

CREATE INDEX model_predictions_version_year_idx
  ON public.model_predictions (model_version, tahun);

CREATE TRIGGER model_predictions_set_updated_at
  BEFORE UPDATE ON public.model_predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.model_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY model_predictions_read ON public.model_predictions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY model_predictions_admin_write ON public.model_predictions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE public.model_coefficients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL
    REFERENCES public.model_metadata(version) ON DELETE CASCADE,
  kode_bps text NOT NULL
    REFERENCES public.regions(kode_bps) ON DELETE CASCADE,
  tahun smallint NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
  predictor_code text NOT NULL
    REFERENCES public.indicator_dictionary(code) ON DELETE RESTRICT,
  coefficient numeric NOT NULL,
  se numeric,
  is_inference boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (model_version, kode_bps, tahun, predictor_code)
);

CREATE INDEX model_coefficients_version_year_idx
  ON public.model_coefficients (model_version, tahun);

CREATE TRIGGER model_coefficients_set_updated_at
  BEFORE UPDATE ON public.model_coefficients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.model_coefficients ENABLE ROW LEVEL SECURITY;

CREATE POLICY model_coefficients_read ON public.model_coefficients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY model_coefficients_admin_write ON public.model_coefficients
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
