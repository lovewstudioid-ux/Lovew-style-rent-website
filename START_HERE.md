# 🚀 Final 7 minutes — get the site running

I've opened Supabase in your Chrome (`https://supabase.com/dashboard/organizations`).
Just follow these steps clicking through your browser yourself — much faster than me driving it.

---

## ① In Supabase (5 minutes)

### A. Create the project
1. On the Organizations page, click an org (or create one named "LOVEW").
2. Click the green **New project** button.
3. Fill in:
   - **Name:** `lovew-style`
   - **Database password:** click "Generate a password" → save it somewhere safe
   - **Region:** **Southeast Asia (Singapore)** ← important for Indonesian users
4. Click **Create new project**. Wait ~2 minutes while it spins up.

### B. Run the 3 SQL files (in order)
While it's spinning up, on the left sidebar click **SQL Editor** → **+ New query**.

Each of these goes in its OWN new query, paste then click **Run**:

1. Paste the contents of `database_schema.sql` (in your `outputs/` folder)
2. New query → paste `db/sql/search_dresses.sql` (in this project folder)
3. New query → paste `db/sql/create_booking_tx.sql` (in this project folder)

After each run you should see "Success. No rows returned" or similar.
After all three, check **Table Editor** in the sidebar — you should see ~17 tables (profiles, dresses, bookings, deposit_ledger, etc.).

### C. Turn off email confirmation (for testing only)
1. Left sidebar → **Authentication** → **Sign In / Up** → tab **Email**
2. Toggle off "**Confirm email**". You'll turn this back on before going live.

### D. Copy the 3 keys
1. Left sidebar → **Project Settings** (the gear icon near the bottom) → **API**
2. Copy these 3 values:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public** key (long `eyJ...` string)
   - **service_role** key (also `eyJ...`, marked secret)

---

## ② Paste them in our chat (10 seconds)

Just paste back to me in the LOVEW chat, exactly like this (with your real values):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-real-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

I'll create your `.env.local` (and generate a CRON_SECRET) immediately.

---

## ③ Then in your project Terminal (2 minutes)

```bash
cd "/Users/joce/Downloads/CLAUDE CODE - LOVEW STYLE"
npm install @supabase/ssr @supabase/supabase-js
```

If your dev server is still running, press **Ctrl+C** to stop it, then:

```bash
npm run dev
```

Open http://localhost:3000 — the site is live.

---

## ④ First-run smoke test (3 minutes)

1. Click **Daftar** (top right) → register your email + password
2. Back in Supabase **SQL Editor** → new query → paste `db/sql/seed.sql` → Run.
   This promotes your account to **admin** and adds 1 sample partner + 3 sample dresses.
3. Sign out and sign back in (refreshes your role).
4. Visit `/browse` — you should see 3 dresses.
5. Click "Aurora Champagne Gown" → pick size M → pick dates 3 days from today → **Booking sekarang**
6. /checkout → tick the agreement → **Konfirmasi booking**
7. /checkout/LV-…/pay → click **Saya sudah bayar**
8. Visit `/admin/bookings` → your booking is there → click it → **Konfirmasi pembayaran**
9. Visit `/partner/bookings` → same booking → walk through **Tandai sedang dipakai** → **Tandai dikembalikan** → **Tandai selesai**

That's the full marketplace loop, running on real data, on your laptop.

---

## If anything errors

Paste the error message in chat and I'll fix it on the spot. The most common issues are:

- **"Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"** — `.env.local` not created or dev server not restarted after creating it
- **"relation public.profiles does not exist"** — you forgot to run `database_schema.sql` in step B
- **"function public.search_dresses does not exist"** — you forgot to run `db/sql/search_dresses.sql`
- **"function public.create_booking_tx does not exist"** — you forgot to run `db/sql/create_booking_tx.sql`

Just paste the error. We'll iterate.
