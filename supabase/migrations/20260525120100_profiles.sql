-- profiles: 1:1 with auth.users. Holds non-sensitive app preferences and role.
-- Created automatically by handle_new_user() trigger on auth.users insert.

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  theme_preference text NOT NULL DEFAULT 'system'
    CHECK (theme_preference IN ('system', 'light', 'dark')),
  locale text NOT NULL DEFAULT 'id-ID',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Owner can read and update its own profile. No INSERT/DELETE: rows are
-- created by the auth trigger and removed via auth.users cascade.
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- is_admin(): SECURITY DEFINER so it can read profiles bypassing RLS.
-- Used by every public reference table's admin-write policy.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Returns true if the current authenticated user has profiles.role = admin.';

-- Trigger: insert a profile row whenever a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
