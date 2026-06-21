-- LOVEW Fashion (lighter version): providers list pieces to rent/shop; you
-- review & publish; published pieces show on /fashion with WhatsApp/IG contact
-- (renting happens directly with the provider — no on-site booking).
-- Run once in Supabase → SQL Editor.

create table if not exists public.fashion_listings (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  status       text not null default 'pending',   -- 'pending' | 'published'
  name         text not null,
  category     text not null default 'Other',
  listing_type text not null default 'Rent',       -- 'Rent' | 'Buy' | 'Rent & Buy'
  size         text,
  price        text,
  city         text,
  description  text,
  whatsapp     text,
  instagram    text,
  image_urls   text[] not null default '{}',
  cover_url    text
);

create index if not exists fashion_listings_status_idx on public.fashion_listings (status, created_at desc);

alter table public.fashion_listings enable row level security;
drop policy if exists "fashion_select_published" on public.fashion_listings;
create policy "fashion_select_published" on public.fashion_listings
  for select using (status = 'published');

insert into storage.buckets (id, name, public)
values ('fashion', 'fashion', true)
on conflict (id) do nothing;
