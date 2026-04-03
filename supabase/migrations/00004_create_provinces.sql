-- Provinces table for 34 Indonesian provinces.
-- geojson stores GeoJSON FeatureCollection for map rendering.

CREATE TABLE provinces (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  geojson JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provinces_slug ON provinces(slug);

CREATE TRIGGER provinces_updated_at
  BEFORE UPDATE ON provinces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: publicly readable
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provinces are publicly readable"
  ON provinces FOR SELECT
  USING (true);
