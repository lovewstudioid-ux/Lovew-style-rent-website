# Pick up here next session 🌸

## What's now in your project

**87 source files** spanning Phases 2–5 + the admin polish to close the loop.

You went to bed with a scaffold and woke up to a marketplace where customers
can book, partners can self-serve their bookings, and you (admin) can
confirm payments, refund deposits, and resolve disputes.

---

## End-to-end flow that works tonight

### 🛒 Customer
1. `/sign-up` → profile row created (role=customer)
2. `/account/sizing` → save measurements + body silhouette
3. `/browse` → filter by city / date / category / occasion / color / size / price + "Fits my size"
4. `/d/[partner]/[dress]` → gallery, variant chips, dates, fits badge, live total
5. `/checkout` → fulfillment + agreement
6. **Atomic booking** (Postgres function) → dates locked, double-booking impossible
7. `/checkout/[code]/pay` → bank transfer + QRIS tabs, 30-min countdown, "I've paid"
8. `/account/bookings` → tabs (Active / Completed), status pill + deposit pill
9. `/account/bookings/[id]` → full breakdown, deposit panel, partner chat shortcut

### 👗 Partner
1. `/partner/dashboard` → KPIs (bookings/GMV/payout-pending/rating) + recent bookings
2. `/partner/bookings` → filter tabs by status (Pending/Confirmed/In use/Returned/Completed)
3. `/partner/bookings/[id]` → **state-machine buttons**:
   - confirmed → **Tandai sedang dipakai**
   - in_use → **Tandai dikembalikan** (schedules 3-day auto-refund)
   - returned → **Tandai selesai** (queues payout) OR **Klaim deposit** (form: amount/reason/description, pauses refund)
   - customer info masked until status=in_use (privacy)
4. `/partner/catalog` → list with **Active/Draft toggle** (hide from /browse instantly)
5. `/partner/payouts` → pending-total card + history table

### 🛠 Admin (you)
1. `/admin` → KPIs (GMV, bookings, partners, dresses, pending payments, refunds due, open disputes)
2. `/admin/bookings/[id]` →
   - **Konfirmasi pembayaran** (pending_payment → confirmed + writes deposit-hold ledger entry)
   - **Tandai sudah refund** (refund_pending → refunded + writes refund ledger entry)
3. `/admin/partners` → approve/suspend, edit commission %
4. `/admin/deposits` → reconciliation total + refunds-due queue (links to bookings)
5. `/admin/disputes` → open claims with **Setujui / Tolak**:
   - Approve N rupiah → ledger payout_to_partner + remainder refund_to_customer + status=partially_withheld | forfeited | refunded
   - Reject → full refund ledger entry + status=refunded
6. `/admin/payouts` → pending-total summary by partner

### 🤖 Background
- `/api/cron/auto-cancel` (Vercel cron, 5-min, CRON_SECRET-protected) — cancels unpaid bookings > 30 min, releases dates

---

## ⏯ Your morning checklist (12 minutes)

### 1. Finish Supabase (5 min) — if not done

1. https://supabase.com/dashboard → **New project** → name `lovew-style`, **Region: Southeast Asia (Singapore)**
2. **SQL Editor**, run these in order — each in a new query:
   - `database_schema.sql` (in your `outputs/` folder)
   - `db/sql/search_dresses.sql`
   - `db/sql/create_booking_tx.sql`
3. **Authentication → Sign In / Up → Email** → turn OFF "Confirm email" (testing)
4. **Project Settings → API** → copy the 3 keys

### 2. Paste me the 3 Supabase values (1 min)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

I'll create `.env.local` + a CRON_SECRET.

### 3. Install + restart (1 min)

```bash
cd "/Users/joce/Downloads/CLAUDE CODE - LOVEW STYLE"
npm install @supabase/ssr @supabase/supabase-js
# Ctrl+C the dev server, then:
npm run dev
```

### 4. Test the full loop (5 min)

#### As a customer:
1. http://localhost:3000/sign-up — register your email
2. Back in Supabase SQL Editor → run `db/sql/seed.sql` (promotes you to admin + 3 sample dresses)
3. Sign out, sign in again (so the role is fresh)
4. http://localhost:3000/browse → 3 dresses appear
5. Click **Aurora Champagne Gown** → size M → dates (3 days from now → 5 days from now) → **Booking sekarang**
6. /checkout shows full breakdown → tick agreement → **Konfirmasi booking**
7. /checkout/LV-…/pay opens → click **Saya sudah bayar**

#### As admin:
8. Visit http://localhost:3000/admin/bookings → your booking is "Menunggu pembayaran"
9. Open it → **Konfirmasi pembayaran** → status flips to Dikonfirmasi, deposit ledger gets a hold entry

#### As partner (you're also the seed partner via SQL):
10. Click your avatar → **Dashboard Partner** → http://localhost:3000/partner/bookings
11. Open the booking → **Tandai sedang dipakai** → status flips
12. **Tandai dikembalikan** → status flips, deposit_due_back_at set 3 days out
13. Either **Tandai selesai** (clean return) or expand **Klaim deposit** (file Rp 50.000 with reason="stain")

#### Back as admin:
14. If you filed a claim → /admin/disputes shows it → enter approved amount → **Setujui** → it splits the deposit (ledger gets payout_to_partner + refund_to_customer entries)
15. If clean completion → /admin/deposits shows the refund-due → open the booking → **Tandai sudah refund** → ledger gets the refund entry

If anything errors, paste the error in chat. I'll fix and we keep going.

---

## What's still on the roadmap

These are real but not blocking soft-launch:

- **Real partner onboarding wizard** (currently a "contact WhatsApp" placeholder)
- **Add/edit dress form** for partners (multi-image upload, variants, availability calendar UI). Currently you/admin can input dresses via SQL or future admin tool.
- **Admin payout batch generator** (the `/admin/payouts` page shows the data; the "Generate batch" action ships later)
- **Notifications** (WhatsApp via Fonnte + email via Resend on every status change)
- **Reviews flow** for completed bookings
- **Real auth callback for OAuth** (works, but Google credentials need to be set in Supabase if you want Google sign-in)

For your Tier 0 launch (manual payments, ~5 partners, low volume), you have everything you need.

---

## Reminders

**Git commit at end of session (Terminal):**

```bash
cd "/Users/joce/Downloads/CLAUDE CODE - LOVEW STYLE"
git init -b main   # only first time
git add -A
git commit -m "feat: phases 2-5 — full marketplace MVP"
```

**Email confirmation off during testing.** Turn back on before going live.

---

You're at the **soft-launch threshold**. The marketplace flow is end-to-end. Take screenshots — you'll be glad you saved them later. 🌸
