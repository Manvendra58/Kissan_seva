# Kisan Seva — Integrated Agriculture Portal

A full-stack web app for Indian farmers and admins:

- Farmer portal: crops, schemes, market prices, **live weather**, queries, calendar, profile
- Admin panel: manage farmers, crops, schemes, prices, weather alerts, queries, notifications, calendar
- Auth via Supabase (email/password + roles)
- AI farming assistant (Supabase Edge Function)

**Stack:** Vite · React · TypeScript · Tailwind · shadcn/ui · Supabase · Open-Meteo

---

## 1. Local setup (required for presentation)

```sh
npm install
cp .env.example .env
```

Edit `.env` and set your **anon/public** key:

```env
VITE_SUPABASE_PROJECT_ID=dgtrcnxudqrnriuxtsrs
VITE_SUPABASE_URL=https://dgtrcnxudqrnriuxtsrs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...your_publishable_key...
```

Get keys from: **Supabase Dashboard → Project Settings → API**  
Use the **publishable / anon** key in Vite. Never put the **secret** key in frontend `.env` or GitHub.

```sh
npm run dev
```

Open http://localhost:8080/

### Database (one-time in Supabase SQL Editor)

Run in order if the project is empty / not fully set up:

1. `supabase/SETUP_DATABASE.sql` — schema + RLS (skip if tables already exist)
2. `supabase/migrations/20260316120000_secure_queries_and_admin.sql` — security fixes
3. `supabase/SEED_DATA.sql` — schemes, calendar, sample prices, welcome notification
4. `supabase/MAKE_ADMIN.sql` — promote your demo admin user (after signup)

### Create demo accounts for presentation

1. Register a **farmer** account in the app (Login → Register).
2. Register an **admin** email, then run `MAKE_ADMIN.sql` with that user’s UUID.
3. Farmer login → `/dashboard`. Admin login → `/admin` automatically.

---

## 2. Deploy (GitHub + Vercel)

### Push to GitHub

```sh
git init
git add .
git commit -m "Initial commit: Kisan Seva production-ready app"
gh repo create kisan-seva --public --source=. --remote=origin --push
```

### Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Import the GitHub repo.
2. Framework: **Vite**. Build: `npm run build`. Output: `dist`.
3. Add environment variables (same as `.env`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Deploy.

### Supabase Auth URLs (important)

In Supabase → **Authentication → URL Configuration**:

- Site URL: your Vercel URL (e.g. `https://kisan-seva.vercel.app`)
- Redirect URLs: add `https://kisan-seva.vercel.app/**` and `http://localhost:8080/**`

---

## 3. Features checklist (for demo)

| Feature | Works when |
|--------|------------|
| Register / Login | Supabase key + Auth enabled |
| Live weather | Profile has district/state (Open-Meteo, no key) |
| Crops | Built-in defaults + optional DB crops |
| Schemes / Prices / Calendar | After `SEED_DATA.sql` or admin creates them |
| Farmer queries | Login as farmer → My Queries |
| Admin CRUD | User has `admin` role in `user_roles` |
| AI assistant | Edge function deployed + `LOVABLE_API_KEY` secret |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Unit tests |

---

## Project structure

```
src/pages/           Farmer + admin screens
src/contexts/        Auth (role-based admin)
src/lib/weather.ts   Live Open-Meteo weather
supabase/            SQL setup, seed, migrations, edge function
```

## License

MIT — use freely for academic / portfolio presentations.
