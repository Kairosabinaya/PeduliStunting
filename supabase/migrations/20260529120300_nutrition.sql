-- Tracker Phase 5:
-- Catatan praktik gizi yang protektif terhadap stunting menurut Buku KIA 2024:
-- ASI Eksklusif (0-6 bln), MPASI (mulai 6 bln), Vitamin A (biru 6-11 bln +
-- merah Februari/Agustus 12-59 bln), dan obat cacing (1-6 th, 2x/tahun).
--
-- Skema sengaja event-style: tiap baris adalah peristiwa diskrit (toggle
-- ASI, tanggal mulai MPASI, kapsul Vit A diberikan, dosis cacing diberikan).
-- UI yang menghitung "status terkini" mereduksi event-event ini per kind.
-- Pendekatan ini menjaga skema stabil walau jenis event nutrisi bertambah
-- dan menjaga histori utuh untuk audit user (orang tua bisa lihat kapan
-- mereka pertama menandai ASI eksklusif misalnya).

CREATE TABLE public.child_nutrition_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN (
    'asi_exclusive',
    'mpasi_started',
    'vit_a_blue',
    'vit_a_red_feb',
    'vit_a_red_aug',
    'deworming'
  )),
  event_date date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, kind, event_date)
);

CREATE INDEX child_nutrition_events_child_idx
  ON public.child_nutrition_events (child_id, event_date DESC);

CREATE INDEX child_nutrition_events_kind_idx
  ON public.child_nutrition_events (child_id, kind, event_date DESC);

CREATE TRIGGER child_nutrition_events_set_updated_at
  BEFORE UPDATE ON public.child_nutrition_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.child_nutrition_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY child_nutrition_events_owner_all ON public.child_nutrition_events
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

COMMENT ON TABLE public.child_nutrition_events IS
  'Tracker Phase 5 — catatan gizi protektif (ASI, MPASI, Vit A, cacing).';
