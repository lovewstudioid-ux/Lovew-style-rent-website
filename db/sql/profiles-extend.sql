-- Extend the account profile with the full sign-up field set. Run once.
-- (Requires public.profiles from db/sql/profiles.sql.)

alter table public.profiles add column if not exists nick_name  text;
alter table public.profiles add column if not exists instagram  text;
alter table public.profiles add column if not exists birth_date text;
alter table public.profiles add column if not exists gender     text;
alter table public.profiles add column if not exists country    text;
alter table public.profiles add column if not exists job_title  text;
-- full_name, phone, city already exist from profiles.sql
