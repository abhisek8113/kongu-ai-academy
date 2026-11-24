# Kongu AI Academy — Portal

Training portal for Kongu AI Academy (Coimbatore). Next.js 14 + Supabase + Tailwind, deployed on Vercel.

## Features
- **Public site** — programmes, formats & prices, trainer profile, demo-request form (saved as leads)
- **5 lab tracks, 27 labs** — AI Labs, ML Labs, Power BI, Power Apps, Power Automate (`lib/labs.ts`)
- **Student accounts** — sign up / log in, mark labs complete with a submission link, progress per track
- **Programmes** — open batches, students request enrolment
- **Student dashboard** — lab progress, enrolments, certificates
- **Admin panel** (`/admin`) — lead pipeline, batches, enrolment approval, student progress, certificate issuing
- **Certificate verification** (`/verify`) — anyone can check a certificate ID

## Go live (about 20 minutes)

1. **Supabase** — create a free project at supabase.com.
   - SQL Editor → paste and run `supabase/schema.sql`.
   - Authentication → URL Configuration → set Site URL to your domain.
2. **Vercel** — vercel.com → Add New Project → import this GitHub repo.
   - Add environment variables from `.env.example`:
     `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API), `NEXT_PUBLIC_SITE_URL`.
   - Deploy.
3. **Make yourself admin** — sign up on the live site, then run in Supabase SQL Editor:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'abhisekmurugesan@gmail.com');
   ```
4. **Domain** — Vercel → Project → Settings → Domains → add e.g. `konguaiacademy.in`.

## Edit content
- Labs: `lib/labs.ts` (add a lab object to any track; pages are generated automatically)
- Prices and home page text: `app/page.tsx`
- Colours and fonts: `tailwind.config.ts`

## Run locally
```bash
cp .env.example .env.local   # fill in your Supabase keys
npm install
npm run dev
```
