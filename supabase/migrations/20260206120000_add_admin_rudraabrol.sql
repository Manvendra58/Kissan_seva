-- Grant admin role to rudraabrol7@gmail.com
-- This migration:
-- 1. Adds admin role to any EXISTING user with this email
-- 2. Updates handle_new_user trigger so FUTURE signups with this email get admin role

-- Step 1: Grant admin role to existing user with rudraabrol7@gmail.com (if they exist)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'rudraabrol7@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Update handle_new_user to grant admin for rudraabrol7@gmail.com on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role := 'farmer';
BEGIN
  INSERT INTO public.profiles (user_id, full_name, mobile, email, state, district, crop_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'mobile',
    NEW.email,
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'crop_type'
  );
  
  -- Grant admin role for rudraabrol7@gmail.com, farmer for everyone else
  IF LOWER(NEW.email) = 'rudraabrol7@gmail.com' THEN
    user_role := 'admin';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;
