-- Metadata for each predictor variable.
-- Drives the simulation UI: names, units, ranges, standardization params.

CREATE TABLE predictor_meta (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code TEXT NOT NULL UNIQUE,
  name_id TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  unit TEXT,
  min_value NUMERIC,
  max_value NUMERIC,
  mean_value NUMERIC NOT NULL,
  std_value NUMERIC NOT NULL,
  source TEXT,
  category TEXT,
  display_order INT NOT NULL DEFAULT 0
);

-- RLS: publicly readable
ALTER TABLE predictor_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Predictor meta is publicly readable"
  ON predictor_meta FOR SELECT
  USING (true);
