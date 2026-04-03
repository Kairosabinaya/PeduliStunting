-- Pre-computed GTWENOLR model coefficients per province per year.
-- Fetched once by frontend for real-time simulation.

CREATE TABLE model_coefficients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id INT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  year INT NOT NULL,
  alpha_1 NUMERIC NOT NULL,
  alpha_2 NUMERIC NOT NULL,
  beta_coefficients JSONB NOT NULL,
  significant_vars JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(province_id, year)
);

CREATE INDEX idx_model_coefficients_province_year ON model_coefficients(province_id, year);

-- RLS: publicly readable
ALTER TABLE model_coefficients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Model coefficients are publicly readable"
  ON model_coefficients FOR SELECT
  USING (true);
