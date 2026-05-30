-- Tracker Phase 6:
-- Pelacakan kehamilan terkini per user untuk persona ibu hamil/calon orang
-- tua. Sumber konten: Buku KIA 2024 (ANC 6x, TTD harian, kenaikan berat,
-- tanda bahaya per trimester). MVP fokus ke kehamilan tunggal yang sedang
-- berjalan; ekspansi multi-kehamilan/histori bisa dilakukan tanpa migrasi
-- skema mayor.

CREATE TABLE public.pregnancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hpht date NOT NULL,
  expected_due date,
  initial_weight_kg numeric
    CHECK (initial_weight_kg IS NULL OR initial_weight_kg > 0),
  height_cm numeric CHECK (height_cm IS NULL OR height_cm > 0),
  notes text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pregnancies_user_idx
  ON public.pregnancies (user_id) WHERE archived_at IS NULL;
CREATE INDEX pregnancies_user_archived_idx
  ON public.pregnancies (user_id, archived_at);

CREATE TRIGGER pregnancies_set_updated_at
  BEFORE UPDATE ON public.pregnancies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY pregnancies_owner_all ON public.pregnancies
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE public.pregnancy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pregnancy_id uuid NOT NULL
    REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN (
    'anc_visit',
    'ttd_dose',
    'weight_measurement'
  )),
  event_date date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pregnancy_id, kind, event_date)
);

CREATE INDEX pregnancy_events_lookup_idx
  ON public.pregnancy_events (pregnancy_id, kind, event_date DESC);

CREATE TRIGGER pregnancy_events_set_updated_at
  BEFORE UPDATE ON public.pregnancy_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pregnancy_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY pregnancy_events_owner_all ON public.pregnancy_events
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

COMMENT ON TABLE public.pregnancies IS
  'Tracker Phase 6 — profil kehamilan terkini user (MVP: satu aktif per user).';
COMMENT ON TABLE public.pregnancy_events IS
  'Tracker Phase 6 — peristiwa kehamilan (ANC visit, TTD dose, weight measurement).';
