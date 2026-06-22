-- Account profile: captured once at sign-up, then pre-fills every form
-- (Style ID, measurement, enquiries) so customers never re-type name/phone.
-- Email comes from auth.users. Run once in Supabase → SQL Editor.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  role        text not null default 'customer',
  full_name   text,
  phone       text,
  city        text,
  avatar_url  text
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
