-- ============================================================
-- You landed on the FARMER dashboard because this email has
-- no "admin" row in user_roles yet. Fix below.
-- ============================================================

-- Step A: see registered users
SELECT id, email, created_at,
       (email_confirmed_at IS NOT NULL) AS email_confirmed
FROM auth.users
ORDER BY created_at DESC;

-- Step B (EASIEST for demo): make the LATEST registered user an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
ORDER BY created_at DESC
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- Step C: verify — you must see your email with role = admin
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE r.role = 'admin';

-- Optional: promote a SPECIFIC email instead (uncomment + edit):
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::public.app_role
-- FROM auth.users
-- WHERE LOWER(email) = LOWER('you@example.com')
-- ON CONFLICT (user_id, role) DO NOTHING;
