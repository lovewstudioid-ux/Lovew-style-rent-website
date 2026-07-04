-- Group gifts are started by a GUEST (the organizer), who collects from the
-- other friends — the money never goes to the owner. Store the organizer and
-- their payment details on the item. Run in Supabase SQL Editor (idempotent).

alter table public.registry_items
  add column if not exists group_organizer text,
  add column if not exists group_payment   text;
