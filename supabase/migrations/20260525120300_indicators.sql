-- indicator_dictionary: lexicon of model variables (Y, Y1, X1..X20) seeded from
--   the "Source" sheet of Dataset.xlsx via the import script (never hardcoded).
-- region_indicators: panel observation per (kode_bps, tahun) with Y category,
--   Y1 prevalence and X1..X20 predictors.

CREATE TABLE public.indicator_dictionary (
  code text PRIMARY KEY,
  dimension text NOT NULL
    CHECK (dimension IN (
      'outcome',
      'socioeconomic',
      'health_service',
      'environment',
      'demography',
      'nutrition',
      'other'
    )),
  name text NOT NULL,
  description text,
  unit text,
  source_label text,
  source_url text,
  effect_direction text
    CHECK (effect_direction IN ('protective', 'risk', 'neutral')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER indicator_dictionary_set_updated_at
  BEFORE UPDATE ON public.indicator_dictionary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.indicator_dictionary ENABLE ROW LEVEL SECURITY;

CREATE POLICY indicator_dictionary_read ON public.indicator_dictionary
  FOR SELECT TO authenticated USING (true);

CREATE POLICY indicator_dictionary_admin_write ON public.indicator_dictionary
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE public.region_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_bps text NOT NULL REFERENCES public.regions(kode_bps) ON DELETE CASCADE,
  tahun smallint NOT NULL CHECK (tahun BETWEEN 2000 AND 2100),
  y_category text NOT NULL CHECK (y_category IN ('Rendah', 'Sedang', 'Tinggi')),
  y1_prevalence numeric(5, 2),
  x1 numeric, x2 numeric, x3 numeric, x4 numeric, x5 numeric,
  x6 numeric, x7 numeric, x8 numeric, x9 numeric, x10 numeric,
  x11 numeric, x12 numeric, x13 numeric, x14 numeric, x15 numeric,
  x16 numeric, x17 numeric, x18 numeric, x19 numeric, x20 numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kode_bps, tahun)
);

CREATE INDEX region_indicators_tahun_idx ON public.region_indicators (tahun);
CREATE INDEX region_indicators_kode_tahun_idx
  ON public.region_indicators (kode_bps, tahun);

CREATE TRIGGER region_indicators_set_updated_at
  BEFORE UPDATE ON public.region_indicators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.region_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY region_indicators_read ON public.region_indicators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY region_indicators_admin_write ON public.region_indicators
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
