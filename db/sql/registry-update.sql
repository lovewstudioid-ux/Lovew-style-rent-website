-- Registry update: add shipping address + show/hide privacy
-- Run in Supabase SQL Editor (idempotent — safe to re-run)

ALTER TABLE registries
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS show_address     boolean NOT NULL DEFAULT false;

-- Ensure note exists on registry_items (was in original schema, but just in case)
ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS note text;
