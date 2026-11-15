# DirectAid Staff & HR Portal

Staff records, school divisions, contracts and documents for DirectAid schools in Hargeisa and Gabiley.

Built with React, Vite, Tailwind CSS and Supabase. Hosted on Vercel.

## Run locally

1. Install dependencies: `npm install`
2. Create `.env.local` with:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server only, never prefix with VITE_
   ADMIN_EMAILS=...                # comma-separated admin emails
   ```
3. Start the app: `npm run dev`

## Database

Run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor. It creates the tables, row-level security, the `staff-documents` storage bucket policies and the single-session table.

## Admin tools

- `api/admin-users.ts` is a Vercel function used by Settings to create and manage HR logins. Set `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS` in the Vercel project settings.
- `node scripts/set-admin.mjs <email>` gives an existing user the admin role.

## Checks

- `npm run lint` type-checks the project and flags unused code.
- `npm run build` builds the production bundle.
