-- profile avatar: extends `profiles` with avatar storage, sourced from either
-- the OAuth provider (Google's `picture`) or a manual upload performed during
-- email/password sign-up before email verification (see ADR-0008). Adds the
-- `avatars` Storage bucket with policies that isolate the anonymous pre-signup
-- upload folder (`_signup/`) from the authenticated per-user folder
-- (`users/{auth.uid}/`).
--
-- Down (manual, single PR per project guidelines §8): drop policies on storage.objects,
-- delete bucket avatars, drop column profiles.avatar_url, restore previous
-- handle_new_user. This migration is intentionally reversible piece by piece.

-- 1. Schema -----------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.avatar_url IS
  'Public URL of the user''s avatar. Populated from Google OAuth ''picture'' or from a manual upload during sign-up (`_signup/` folder), or set later from /account.';

-- 2. Trigger ----------------------------------------------------------------
-- Replaces the previous handle_new_user(). Reads display name and avatar from
-- a prioritised list of metadata keys so the same trigger serves both manual
-- sign-up (where the Server Action sets `display_name` + `avatar_url`) and
-- Google OAuth (where Supabase auto-fills `name` / `full_name` / `picture`).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_avatar_url text;
BEGIN
  v_display_name := NULLIF(COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.email
  ), '');

  v_avatar_url := NULLIF(COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  ), '');

  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, v_display_name, v_avatar_url);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auth trigger: inserts a profiles row for every new auth.users entry. Display name source priority: display_name -> full_name -> name -> email. Avatar source priority: avatar_url -> picture.';

-- 3. Backfill ---------------------------------------------------------------
-- Existing rows created before this migration may have a missing display name
-- (Google users) or a NULL avatar despite Google providing a picture. Copy
-- the missing values from auth.users metadata. Read-only on auth.users.

UPDATE public.profiles AS p
SET avatar_url = NULLIF(COALESCE(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ), '')
FROM auth.users AS u
WHERE p.user_id = u.id
  AND p.avatar_url IS NULL
  AND COALESCE(
        u.raw_user_meta_data->>'avatar_url',
        u.raw_user_meta_data->>'picture'
      ) IS NOT NULL;

UPDATE public.profiles AS p
SET display_name = NULLIF(COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name'
    ), '')
FROM auth.users AS u
WHERE p.user_id = u.id
  AND (p.display_name IS NULL OR p.display_name = u.email)
  AND COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name'
      ) IS NOT NULL;

-- 4. Storage bucket --------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. Storage policies ------------------------------------------------------
-- Drop & recreate so the migration stays idempotent across reruns.

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
DROP POLICY IF EXISTS avatars_service_role_write ON storage.objects;
DROP POLICY IF EXISTS avatars_user_insert ON storage.objects;
DROP POLICY IF EXISTS avatars_user_update ON storage.objects;
DROP POLICY IF EXISTS avatars_user_delete ON storage.objects;

-- Anyone (anon + authenticated) can SELECT from the avatars bucket because
-- the URLs are rendered in the public UI (e.g. floating header) and contain
-- non-guessable UUID filenames.
CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Service-role bypasses RLS by default, but we add an explicit policy for
-- clarity and to allow tests asserting service-role can ALL operations.
CREATE POLICY avatars_service_role_write ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

-- Authenticated users can manage avatars only under their own folder
-- `users/{auth.uid}/...`. This path is used by the post-sign-in
-- avatar editor on /account. The pre-signup pending folder `_signup/`
-- is intentionally excluded — only the service-role can write there.
CREATE POLICY avatars_user_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  );

CREATE POLICY avatars_user_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  );

CREATE POLICY avatars_user_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  );
