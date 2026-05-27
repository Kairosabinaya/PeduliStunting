-- education_articles: stubs sourced from Buku KIA 2024; full body inserted by admin
-- via import script. Slug is the canonical public identifier.

CREATE TABLE public.education_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  topic text NOT NULL
    CHECK (topic IN (
      'kehamilan',
      'persalinan',
      'nifas',
      'bayi',
      'balita',
      'gizi',
      'imunisasi',
      'perkembangan',
      'kesehatan_umum'
    )),
  min_age_months smallint CHECK (min_age_months IS NULL OR min_age_months >= 0),
  max_age_months smallint CHECK (max_age_months IS NULL OR max_age_months >= 0),
  summary text,
  body_md text,
  source_label text,
  source_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT education_articles_age_range_chk
    CHECK (
      min_age_months IS NULL
      OR max_age_months IS NULL
      OR min_age_months <= max_age_months
    )
);

CREATE INDEX education_articles_topic_idx ON public.education_articles (topic);
CREATE INDEX education_articles_published_at_idx
  ON public.education_articles (published_at DESC NULLS LAST);

CREATE TRIGGER education_articles_set_updated_at
  BEFORE UPDATE ON public.education_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY education_articles_read ON public.education_articles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY education_articles_admin_write ON public.education_articles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
