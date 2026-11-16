-- Promote a registered user to admin (run AFTER the presentation).
-- 1. Sign up in the app with your admin email.
-- 2. Find the user id:
--      SELECT id, email FROM auth.users ORDER BY created_at DESC;
-- 3. Replace the UUID below and run this script.

-- Example:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Or promote by email (copy/paste email):
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE LOWER(email) = LOWER('YOUR_ADMIN_EMAIL@example.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify:
-- SELECT u.email, r.role
-- FROM auth.users u
-- JOIN public.user_roles r ON r.user_id = u.id
-- WHERE r.role = 'admin';
