-- Wardrobe feature: per-user closet of items (image + category + links).
-- Run once in Supabase → SQL Editor.

create table if not exists public.wardrobe_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  name        text not null,
  category    text not null default 'other',
  image_path  text,            -- path in the 'wardrobe' storage bucket (uploaded)
  image_url   text,            -- OR an external image link
  link_url    text,            -- optional source/shop link
  note        text
);

create index if not exists wardrobe_items_user_idx on public.wardrobe_items (user_id, created_at desc);

-- Row-level security: each user sees & edits only their own items.
alter table public.wardrobe_items enable row level security;

drop policy if exists "wardrobe_select_own" on public.wardrobe_items;
create policy "wardrobe_select_own" on public.wardrobe_items
  for select using (auth.uid() = user_id);

drop policy if exists "wardrobe_insert_own" on public.wardrobe_items;
create policy "wardrobe_insert_own" on public.wardrobe_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "wardrobe_update_own" on public.wardrobe_items;
create policy "wardrobe_update_own" on public.wardrobe_items
  for update using (auth.uid() = user_id);

drop policy if exists "wardrobe_delete_own" on public.wardrobe_items;
create policy "wardrobe_delete_own" on public.wardrobe_items
  for delete using (auth.uid() = user_id);

-- Public-read bucket for wardrobe images (so the gallery loads without signed URLs).
insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', true)
on conflict (id) do nothing;

-- Authenticated users may upload/manage only files under their own folder: <uid>/...
drop policy if exists "wardrobe_obj_insert_own" on storage.objects;
create policy "wardrobe_obj_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wardrobe_obj_delete_own" on storage.objects;
create policy "wardrobe_obj_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
