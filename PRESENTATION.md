# Kisan Seva — Presentation go-live checklist

Use this before showing the project to others.

## A. Must do (or login/data will fail)

- [ ] Open Supabase project `dgtrcnxudqrnriuxtsrs`
- [ ] Copy **publishable / anon** key → paste into local `.env` as `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] Run `SETUP_DATABASE.sql` on this project (new projects have no tables yet)
- [ ] Same key → Vercel Environment Variables for production
- [ ] Restart `npm run dev` after saving `.env`

## B. Database

- [ ] Run `SETUP_DATABASE.sql` if tables missing
- [ ] Run `migrations/20260316120000_secure_queries_and_admin.sql`
- [ ] Run `SEED_DATA.sql` (schemes, prices, calendar)
- [ ] Register admin user in the app
- [ ] Run `MAKE_ADMIN.sql` with that email
- [ ] Register a farmer user for the demo

## C. Demo flow (5–7 minutes)

1. **Landing** → Login / Register  
2. **Farmer**: Dashboard (live weather) → Crops → Schemes → Market Prices → Weather → New Query → Profile  
3. **Logout** → Login as admin → Admin dashboard → answer query → add/edit a price or scheme  
4. Optional: Farming Assistant chat (needs edge function + Lovable key)

## D. GitHub + live URL

- [ ] Code pushed to GitHub
- [ ] Vercel project linked and deployed
- [ ] Supabase Auth Site URL + Redirect URLs set to Vercel domain
- [ ] Open the Vercel URL on phone + laptop before presenting

## Talking points

- Role-based access (farmer vs admin) with Supabase RLS  
- Live weather without a paid weather API (Open-Meteo)  
- Full admin CRUD for real content management  
- Production deploy on Vercel with env secrets (key not in GitHub)
