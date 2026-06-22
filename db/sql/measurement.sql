-- Measurement (part of Style ID): extends style_profiles with the full Tally
-- field set + computed body type. Run once in Supabase → SQL Editor.
-- (Requires style_profiles from db/sql/style-profile.sql.)

alter table public.style_profiles add column if not exists high_hip text;
alter table public.style_profiles add column if not exists pants_size text;
alter table public.style_profiles add column if not exists feet_length_cm text;
alter table public.style_profiles add column if not exists body_type text;
