-- Secure farmer_queries updates and remove email-hardcoded admin checks.
-- Apply in Supabase SQL Editor if migrations are not auto-applied.

-- 1. Role-only admin check (no hardcoded email)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- 2. Block farmers from changing admin-owned query fields
CREATE OR REPLACE FUNCTION public.protect_farmer_query_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.admin_response IS DISTINCT FROM OLD.admin_response
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.responded_at IS DISTINCT FROM OLD.responded_at THEN
      RAISE EXCEPTION 'Only admins can update query status or admin response';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_farmer_query_admin_fields ON public.farmer_queries;
CREATE TRIGGER protect_farmer_query_admin_fields
  BEFORE UPDATE ON public.farmer_queries
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_farmer_query_admin_fields();

-- 3. Split UPDATE policies: admins full access; farmers only own content rows
DROP POLICY IF EXISTS "Users can update own queries or admins can update" ON public.farmer_queries;

CREATE POLICY "Admins can update any query"
ON public.farmer_queries
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Farmers can update own query content"
ON public.farmer_queries
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND NOT public.is_admin())
WITH CHECK (user_id = auth.uid());
