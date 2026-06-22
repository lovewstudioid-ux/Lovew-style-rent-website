-- Commission tracking (Level 1): every customer→vendor intro is logged with a
-- reference code. Vendors self-report the outcome; you reconcile in the dashboard.
-- All access is via service-role server actions, so no public policies (keeps
-- customer contacts private). Run once in Supabase → SQL Editor.

create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  ref_code        text unique not null,
  created_at      timestamptz not null default now(),
  source          text not null,                    -- 'space' | 'fashion'
  listing_id      uuid,
  listing_name    text not null,
  vendor_contact  text,                             -- vendor wa/ig (reference)
  customer_name   text not null,
  customer_contact text,
  note            text,
  status          text not null default 'new',      -- new | contacted | booked | lost
  deal_value      numeric,
  commission_pct  numeric not null default 10,
  reported_by     text,
  booked_at       timestamptz
);

create index if not exists inquiries_created_idx on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;
-- Intentionally no policies: only the service-role client (server actions) reads/writes.
