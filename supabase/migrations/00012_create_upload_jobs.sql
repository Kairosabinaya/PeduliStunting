-- Async dataset upload processing queue.

CREATE TYPE upload_status AS ENUM ('queued', 'processing', 'complete', 'failed');
CREATE TYPE model_type AS ENUM ('GTWENOLR', 'GWENOLR', 'ENOLR');

CREATE TABLE upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  status upload_status NOT NULL DEFAULT 'queued',
  model_type model_type NOT NULL DEFAULT 'GTWENOLR',
  result_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_upload_jobs_user_id ON upload_jobs(user_id);
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);

-- RLS: users can read/insert own jobs
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upload jobs"
  ON upload_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upload jobs"
  ON upload_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
