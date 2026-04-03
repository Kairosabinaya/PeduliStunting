-- Stunting prevalence data per province per year.

CREATE TYPE stunting_category AS ENUM ('Rendah', 'Sedang', 'Tinggi');

CREATE TABLE stunting_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id INT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  year INT NOT NULL,
  prevalence_rate NUMERIC(5,2) NOT NULL,
  category stunting_category NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(province_id, year)
);

CREATE INDEX idx_stunting_data_province_year ON stunting_data(province_id, year);

-- RLS: publicly readable
ALTER TABLE stunting_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stunting data is publicly readable"
  ON stunting_data FOR SELECT
  USING (true);
