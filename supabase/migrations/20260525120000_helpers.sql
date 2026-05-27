-- Shared helper: keeps every table's updated_at column current on UPDATE.
-- Attach via: CREATE TRIGGER ... BEFORE UPDATE ON <table> FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Trigger function: stamps NEW.updated_at = now() on every row UPDATE.';
