-- Registry: track whether a reserved gift was already bought.
-- Run in Supabase SQL Editor (idempotent — safe to re-run).

alter table public.registry_items
  add column if not exists purchased boolean not null default false;
