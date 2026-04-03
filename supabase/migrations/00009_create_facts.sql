-- Stunting facts, optionally tagged to a province.
-- province_id NULL means national/general fact.

CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  province_id INT REFERENCES provinces(id) ON DELETE SET NULL,
  source TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facts_province_id ON facts(province_id);
CREATE INDEX idx_facts_is_active ON facts(is_active);

-- RLS: active facts publicly readable, admins can manage all
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active facts are publicly readable"
  ON facts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage facts"
  ON facts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
