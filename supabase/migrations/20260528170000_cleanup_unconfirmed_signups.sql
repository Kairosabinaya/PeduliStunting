-- Auto-cleanup unconfirmed sign-ups after 15 minutes so the same email
-- can be re-registered without hitting Supabase's `user_repeated_signup`
-- guard. Token expiry is also 15 minutes (set in Auth dashboard), so the
-- timing keeps the two in sync.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_signups()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_deleted integer;
BEGIN
  WITH deleted AS (
    DELETE FROM auth.users
    WHERE email_confirmed_at IS NULL
      AND created_at < now() - interval '15 minutes'
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;
  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.cleanup_unconfirmed_signups() IS
  'Deletes auth.users entries that never confirmed their email within 15 minutes. Profiles row is removed via auth.users -> profiles cascade.';

-- Unschedule any previous incarnation before re-scheduling so the
-- migration is idempotent across reruns.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'cleanup-unconfirmed-signups';

SELECT cron.schedule(
  'cleanup-unconfirmed-signups',
  '*/5 * * * *',
  $cron$ SELECT public.cleanup_unconfirmed_signups(); $cron$
);
