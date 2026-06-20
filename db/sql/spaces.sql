-- Spaces vendor listings: owners submit a studio/venue; you review & publish;
-- published listings show on /spaces with WhatsApp/IG contact (no booking).
-- Run once in Supabase → SQL Editor.

create table if not exists public.space_listings (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  status       text not null default 'pending',   -- 'pending' | 'published'
  name         text not null,
  space_type   text not null default 'Other',
  city         text,
  area         text,
  price_from   text,
  description  text,
  whatsapp     text,
  instagram    text,
  image_urls   text[] not null default '{}',
  cover_url    text
);

create index if not exists space_listings_status_idx on public.space_listings (status, created_at desc);

-- RLS: the public can read ONLY published listings. All writes (submit by anyone,
-- publish/delete by the studio admin) go through server actions using the
-- service-role client, so there are no public write policies.
alter table public.space_listings enable row level security;
drop policy if exists "spaces_select_published" on public.space_listings;
create policy "spaces_select_published" on public.space_listings
  for select using (status = 'published');

-- Public-read bucket for listing photos (uploaded server-side via service role).
insert into storage.buckets (id, name, public)
values ('spaces', 'spaces', true)
on conflict (id) do nothing;
