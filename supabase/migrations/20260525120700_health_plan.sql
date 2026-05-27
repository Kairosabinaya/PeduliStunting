-- Health plan bounded context:
--   immunization_schedule + milestones: public reference (seeded via import).
--   child_immunizations + child_milestones: owner-only progress trackers.

CREATE TABLE public.immunization_schedule (
  code text PRIMARY KEY,
  name text NOT NULL,
  dose_number smallint CHECK (dose_number IS NULL OR dose_number > 0),
  recommended_age_months smallint
    CHECK (recommended_age_months IS NULL OR recommended_age_months >= 0),
  notes text,
  display_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX immunization_schedule_order_idx
  ON public.immunization_schedule (display_order, code);

CREATE TRIGGER immunization_schedule_set_updated_at
  BEFORE UPDATE ON public.immunization_schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.immunization_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY immunization_schedule_read ON public.immunization_schedule
  FOR SELECT TO authenticated USING (true);

CREATE POLICY immunization_schedule_admin_write ON public.immunization_schedule
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE public.child_immunizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  immunization_code text NOT NULL
    REFERENCES public.immunization_schedule(code) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'done', 'skipped')),
  given_at date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, immunization_code)
);

CREATE INDEX child_immunizations_child_idx
  ON public.child_immunizations (child_id);

CREATE TRIGGER child_immunizations_set_updated_at
  BEFORE UPDATE ON public.child_immunizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.child_immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY child_immunizations_owner_all ON public.child_immunizations
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  domain text NOT NULL
    CHECK (domain IN ('gross_motor', 'fine_motor', 'language', 'social')),
  min_age_months smallint NOT NULL CHECK (min_age_months >= 0),
  max_age_months smallint NOT NULL CHECK (max_age_months >= 0),
  description text NOT NULL,
  source_label text,
  display_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT milestones_age_range_chk CHECK (min_age_months <= max_age_months)
);

CREATE INDEX milestones_domain_age_idx
  ON public.milestones (domain, min_age_months);

CREATE TRIGGER milestones_set_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY milestones_read ON public.milestones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY milestones_admin_write ON public.milestones
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TABLE public.child_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  milestone_id uuid NOT NULL REFERENCES public.milestones(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'not_checked'
    CHECK (status IN ('not_checked', 'achieved', 'delayed')),
  checked_at date,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, milestone_id)
);

CREATE INDEX child_milestones_child_idx ON public.child_milestones (child_id);

CREATE TRIGGER child_milestones_set_updated_at
  BEFORE UPDATE ON public.child_milestones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.child_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY child_milestones_owner_all ON public.child_milestones
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
