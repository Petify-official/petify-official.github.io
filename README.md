# Petify Storefront

Petify's product catalog is a React + Vite web app. Product data can come from Supabase; when Supabase is not configured or its catalog request fails, the storefront uses the bundled catalog in `src/data/catalog.js`.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Run `npm install`.
3. Run `npm run dev` and open the URL Vite prints.

## Connect Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor, then run `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project's API settings.
4. Restart Vite. The catalog service reads active products from `public.products`.

Only the public anon key belongs in this frontend. Never put a service-role key in a `VITE_` variable. Product reads are public through row-level security; writes should later be done through an authenticated admin flow or trusted server function.

## Future mobile app

The React UI is kept separate from catalog access: `src/services/catalog.js` owns the web data source and the database is the shared contract. A future Expo/React Native app can use the same Supabase project, table, policies, and product fields with its own native UI. Move shared data mapping/types into a small shared package if both clients need identical client-side logic.

## Build

Run `npm run build` for the production bundle and `npm run preview` to inspect it locally.