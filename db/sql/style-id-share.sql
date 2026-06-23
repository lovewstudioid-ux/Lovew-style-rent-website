-- Saved Style ID results → shareable short link /s/[slug].
-- Public read so the share link works for anyone. Run once in Supabase.

create table if not exists public.style_id_results (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  created_at  timestamptz not null default now(),
  name        text,
  analysis    jsonb not null,
  photo_url   text
);

alter table public.style_id_results enable row level security;
drop policy if exists "style_id_results_select_public" on public.style_id_results;
create policy "style_id_results_select_public" on public.style_id_results for select using (true);
-- Inserts happen via the service-role server action only.

insert into storage.buckets (id, name, public)
values ('style-id-public', 'style-id-public', true)
on conflict (id) do nothing;
