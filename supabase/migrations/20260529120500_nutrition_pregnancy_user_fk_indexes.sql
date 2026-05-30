-- Tracker Phase 6 finalization:
-- Covering indexes untuk FK `user_id` di tabel event-style yang baru.
-- Supabase advisor (lint 0001_unindexed_foreign_keys) menandai dua tabel
-- ini perlu indeks karena RLS owner-only selalu memfilter via `user_id`.
-- Tabel `pregnancies` sudah punya indeks user_id; di sini hanya event tables.

CREATE INDEX IF NOT EXISTS child_nutrition_events_user_idx
  ON public.child_nutrition_events (user_id);

CREATE INDEX IF NOT EXISTS pregnancy_events_user_idx
  ON public.pregnancy_events (user_id);
