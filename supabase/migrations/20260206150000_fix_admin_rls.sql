-- Fix RLS: Allow rudraabrol@gmail.com to perform admin operations even without user_roles entry
-- This resolves "new row violates row-level security policy" when admin adds/updates/deletes

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND LOWER(email) = 'rudraabrol7@gmail.com'
    );
$$;
