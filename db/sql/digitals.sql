-- Digital products shop: you add templates (cover + price + external checkout
-- link from your seller platform); buyers purchase & download on that platform.
-- Run once in Supabase → SQL Editor.

create table if not exists public.digital_products (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  status       text not null default 'published',   -- 'published' | 'hidden'
  title        text not null,
  category     text not null default 'Templates',
  price        text,
  description  text,
  cover_url    text,
  cover_path   text,
  buy_url      text,        -- external checkout (Mayar / Lynk / Karyakarsa / etc.)
  sort         int not null default 0
);

create index if not exists digital_products_status_idx on public.digital_products (status, sort, created_at desc);

-- RLS: public reads only published; all writes via service-role server actions.
alter table public.digital_products enable row level security;
drop policy if exists "digitals_select_published" on public.digital_products;
create policy "digitals_select_published" on public.digital_products
  for select using (status = 'published');

insert into storage.buckets (id, name, public)
values ('digitals', 'digitals', true)
on conflict (id) do nothing;
