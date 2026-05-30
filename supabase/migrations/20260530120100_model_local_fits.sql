-- model_local_fits: per (model_version, kode_bps, tahun) ordinal intercepts and
-- fit diagnostics for the GTWENOLR local predictor.
--
-- The intercepts (alfa1, alfa2) and fit diagnostics (n_active, converged) are
-- per region-year, whereas `model_coefficients` is per predictor (one slope per
-- row). Storing them here keeps each table single-responsibility: this table
-- holds the link-function intercepts, `model_coefficients` holds the slopes.
--
-- The what-if simulator reads exactly one row of this table per region-year
-- selection, joined with the 20 matching `model_coefficients` rows, to feed the
-- pure `predictOrdinal()` domain service.
--
-- Read access is granted to anon as well, because /dashboard is a public
-- surface (research output, no PII). Reverse: DROP TABLE public.model_local_fits.

CREATE TABLE public.model_local_fits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL
    REFERENCES public.model_metadata(version) ON DELETE CASCADE,
  kode_bps text NOT NULL
    REFERENCES public.regions(kode_bps) ON DELETE CASCADE,
  tahun smallint NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
  alfa1 numeric NOT NULL,
  alfa2 numeric NOT NULL,
  n_active smallint,
  converged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- The unique constraint also provides the composite index used by the
  -- simulator's exact-match lookup (model_version, kode_bps, tahun).
  UNIQUE (model_version, kode_bps, tahun)
);

CREATE TRIGGER model_local_fits_set_updated_at
  BEFORE UPDATE ON public.model_local_fits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.model_local_fits ENABLE ROW LEVEL SECURITY;

CREATE POLICY model_local_fits_read ON public.model_local_fits
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY model_local_fits_admin_write ON public.model_local_fits
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
