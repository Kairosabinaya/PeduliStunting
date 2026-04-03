-- Saved simulation results per user.

CREATE TYPE simulation_type AS ENUM ('province', 'national');

CREATE TABLE simulation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type simulation_type NOT NULL,
  province_id INT REFERENCES provinces(id) ON DELETE SET NULL,
  input_params JSONB NOT NULL,
  output_results JSONB NOT NULL,
  report_pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_simulation_history_user_id ON simulation_history(user_id);
CREATE INDEX idx_simulation_history_created_at ON simulation_history(created_at DESC);

-- RLS: users can CRUD own simulations
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON simulation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON simulation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON simulation_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON simulation_history FOR DELETE
  USING (auth.uid() = user_id);
