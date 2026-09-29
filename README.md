# Petify Official

Petify's product catalog is a React + Vite web app. Product data can come from Supabase; when Supabase is not configured or its catalog request fails, the storefront uses the bundled catalog in `src/data/catalog.js`.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Run `npm install`.
3. Run `npm run dev` and open the URL Vite prints.

## Connect Supabase and enable `/ #admin`

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor, then run `supabase/seed.sql` to insert the current catalog.
3. Run `supabase/admin.sql` to create the admin role, product write policies, and public image bucket.
4. In Supabase Authentication, create your account. Do not enable public sign-ups.
5. In Authentication → Users, copy your account's UUID. In the SQL Editor, assign that account admin access:

   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

6. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project's API settings. Restart Vite.
7. Visit `/#admin`, sign in with the account you created, and manage products. Product photos upload to the `product-images` Storage bucket.

Only the public anon key belongs in this frontend. Never put a service-role key in a `VITE_` variable. Visitors can read active products; database and Storage writes require the assigned admin role.

## Future mobile app

The React UI is kept separate from catalog access: `src/services/catalog.js` owns the web data source and the database is the shared contract. A future Expo/React Native app can use the same Supabase project, table, policies, and product fields with its own native UI. Move shared data mapping/types into a small shared package if both clients need identical client-side logic.

## Build

Run `npm run build` for the production bundle and `npm run preview` to inspect it locally.
