-- Predictor variable data: 20 socioeconomic variables per province per year.

CREATE TABLE predictor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id INT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  year INT NOT NULL,
  x1_ikt NUMERIC,
  x2_sanitasi NUMERIC,
  x3_air_minum NUMERIC,
  x4_kemiskinan NUMERIC,
  x5_rls_perempuan NUMERIC,
  x6_hamil_muda NUMERIC,
  x7_asi_eksklusif NUMERIC,
  x8_unmet_need NUMERIC,
  x9_pph NUMERIC,
  x10_hunian_layak NUMERIC,
  x11_lpp NUMERIC,
  x12_persen_penduduk NUMERIC,
  x13_kepadatan NUMERIC,
  x14_rasio_jk NUMERIC,
  x15_aps NUMERIC,
  x16_buta_aksara NUMERIC,
  x17_imunisasi NUMERIC,
  x18_pengangguran NUMERIC,
  x19_ipm NUMERIC,
  x20_pengeluaran NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(province_id, year)
);

CREATE INDEX idx_predictor_data_province_year ON predictor_data(province_id, year);

-- RLS: publicly readable
ALTER TABLE predictor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Predictor data is publicly readable"
  ON predictor_data FOR SELECT
  USING (true);
