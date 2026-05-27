-- regions: canonical reference of Indonesian kabupaten/kota (BPS code as natural PK).
-- region_boundaries: simplified GeoJSON per region for choropleth rendering.

CREATE TABLE public.regions (
  kode_bps text PRIMARY KEY
    CHECK (kode_bps ~ '^[0-9]{4}$'),
  provinsi text NOT NULL,
  kabupaten_kota text NOT NULL,
  tipe text NOT NULL CHECK (tipe IN ('Kabupaten', 'Kota')),
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX regions_provinsi_idx ON public.regions (provinsi);
CREATE INDEX regions_kabupaten_kota_idx ON public.regions (kabupaten_kota);

CREATE TRIGGER regions_set_updated_at
  BEFORE UPDATE ON public.regions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY regions_read ON public.regions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY regions_admin_write ON public.regions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE public.region_boundaries (
  kode_bps text PRIMARY KEY
    REFERENCES public.regions(kode_bps) ON DELETE CASCADE,
  geometry jsonb NOT NULL,
  simplification_tolerance numeric,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER region_boundaries_set_updated_at
  BEFORE UPDATE ON public.region_boundaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.region_boundaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY region_boundaries_read ON public.region_boundaries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY region_boundaries_admin_write ON public.region_boundaries
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
