-- Customer Style Profile: each customer saves their sizing/measurements so
-- providers & stylists know their fit. One row per user. Run once in Supabase.

create table if not exists public.style_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  updated_at   timestamptz not null default now(),
  full_name    text,
  whatsapp     text,
  height_cm    text,
  weight_kg    text,
  bust         text,
  waist        text,
  hips         text,
  top_size     text,
  bottom_size  text,
  dress_size   text,
  shoe_size    text,
  notes        text
);

alter table public.style_profiles enable row level security;

drop policy if exists "style_profiles_select_own" on public.style_profiles;
create policy "style_profiles_select_own" on public.style_profiles for select using (auth.uid() = user_id);
drop policy if exists "style_profiles_insert_own" on public.style_profiles;
create policy "style_profiles_insert_own" on public.style_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "style_profiles_update_own" on public.style_profiles;
create policy "style_profiles_update_own" on public.style_profiles for update using (auth.uid() = user_id);
