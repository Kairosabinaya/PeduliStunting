-- Tracker bounded context:
--   growth_standards: WHO LMS reference (public read).
--   children + growth_measurements: owner-only data (RLS by user_id).

-- WHO LMS standards.
-- For length/height-for-age, weight-for-age, head-circumference-for-age, BMI-for-age:
--   age_months is the axis, x_value is NULL.
-- For weight-for-length/height:
--   age_months is unused (set 0) and x_value carries the length/height in cm.
CREATE TABLE public.growth_standards (
  indicator text NOT NULL
    CHECK (indicator IN ('BB_U', 'TB_U', 'BB_TB', 'LK_U')),
  sex text NOT NULL CHECK (sex IN ('L', 'P')),
  age_months smallint NOT NULL CHECK (age_months >= 0),
  x_value numeric NOT NULL DEFAULT 0,
  l numeric NOT NULL,
  m numeric NOT NULL CHECK (m > 0),
  s numeric NOT NULL CHECK (s > 0),
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (indicator, sex, age_months, x_value)
);

CREATE INDEX growth_standards_lookup_idx
  ON public.growth_standards (indicator, sex, age_months);

CREATE TRIGGER growth_standards_set_updated_at
  BEFORE UPDATE ON public.growth_standards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.growth_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY growth_standards_read ON public.growth_standards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY growth_standards_admin_write ON public.growth_standards
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- children: owned by user_id.
CREATE TABLE public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  sex text NOT NULL CHECK (sex IN ('L', 'P')),
  birth_date date NOT NULL,
  birth_weight_kg numeric CHECK (birth_weight_kg IS NULL OR birth_weight_kg > 0),
  birth_length_cm numeric CHECK (birth_length_cm IS NULL OR birth_length_cm > 0),
  gestational_age_weeks smallint
    CHECK (gestational_age_weeks IS NULL OR gestational_age_weeks BETWEEN 20 AND 45),
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX children_user_idx ON public.children (user_id) WHERE deleted_at IS NULL;
CREATE INDEX children_user_birth_idx
  ON public.children (user_id, birth_date) WHERE deleted_at IS NULL;

CREATE TRIGGER children_set_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY children_owner_all ON public.children
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- growth_measurements: owner-only, denormalised user_id for RLS speed.
CREATE TABLE public.growth_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  measured_at date NOT NULL,
  weight_kg numeric CHECK (weight_kg IS NULL OR weight_kg > 0),
  height_cm numeric CHECK (height_cm IS NULL OR height_cm > 0),
  measured_lying boolean,
  head_circumference_cm numeric
    CHECK (head_circumference_cm IS NULL OR head_circumference_cm > 0),
  muac_cm numeric CHECK (muac_cm IS NULL OR muac_cm > 0),
  z_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  sd_class jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, measured_at)
);

CREATE INDEX growth_measurements_child_idx
  ON public.growth_measurements (child_id, measured_at DESC);

CREATE TRIGGER growth_measurements_set_updated_at
  BEFORE UPDATE ON public.growth_measurements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.growth_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY growth_measurements_owner_all ON public.growth_measurements
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
