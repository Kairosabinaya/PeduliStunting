-- Articles CMS table.

CREATE TYPE article_status AS ENUM ('draft', 'published');

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  category TEXT,
  status article_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author_id ON articles(author_id);

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: published readable by all, admin full CRUD
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are publicly readable"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all articles"
  ON articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
