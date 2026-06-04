-- ============================================================================
-- LOVEW Style seed data — for local dev / first-look testing.
-- Run AFTER database_schema.sql and search_dresses.sql.
--
-- Creates:
--   * 1 partner (Atelier Mawar, Jakarta) — owner is the first user in
--     auth.users (i.e. whoever signed up first).
--   * 3 active dresses with 2 variants each and a Cloudinary placeholder image.
--   * The first profile in `profiles` (your test account) is promoted to admin.
--
-- Re-running is idempotent: it skips if the partner already exists.
-- ============================================================================

do $$
declare
  v_owner uuid;
  v_partner uuid;
begin
  -- First registered user becomes owner of the seed partner + an admin.
  select id into v_owner from auth.users order by created_at asc limit 1;
  if v_owner is null then
    raise notice 'No users found. Sign up at /sign-up first, then re-run this seed.';
    return;
  end if;

  update public.profiles set role = 'admin' where id = v_owner;

  -- Ensure the seed partner exists.
  select id into v_partner from public.partners where slug = 'atelier-mawar';
  if v_partner is null then
    insert into public.partners (
      owner_user_id, brand_name, slug, description, city,
      address, whatsapp, instagram,
      pickup_available, shipping_available, shipping_cities,
      commission_pct, status, rating_avg, rating_count
    ) values (
      v_owner,
      'Atelier Mawar',
      'atelier-mawar',
      'Studio couture independen di Jakarta Selatan. Spesialisasi gown malam, kebaya modern, dan dress occasion.',
      'jakarta',
      'Jl. Wijaya II No. 12, Kebayoran Baru, Jakarta Selatan',
      '6281234567890',
      'https://instagram.com/ateliermawar',
      true, true, array['jakarta','bandung']::city_code[],
      15.00, 'active', 4.8, 23
    )
    returning id into v_partner;
  end if;

  -- Clear and re-seed dresses for clean re-runs.
  delete from public.dresses where partner_id = v_partner;

  -- Dress 1 — Aurora Champagne Gown
  with d as (
    insert into public.dresses (
      partner_id, title, slug, description, designer, category, sub_category,
      occasions, colors, primary_color, style_tags,
      daily_price_idr, retail_price_idr, deposit_idr,
      min_rental_days, max_rental_days,
      cover_image_url, status, rating_avg, rating_count
    ) values (
      v_partner,
      'Aurora Champagne Gown',
      'aurora-champagne-gown',
      'Gown malam dengan korset terstruktur, rok mengembang, dan detail beading halus di area dada. Cocok untuk resepsi pernikahan, gala dinner, atau prom night.',
      'Atelier Mawar',
      'gown',
      'evening',
      array['wedding','engagement','prom'],
      array['champagne','gold','beige'],
      'champagne',
      array['glam','romantic'],
      650000, 8500000, 500000,
      1, 5,
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_900,h_1125/sample.jpg',
      'active', 4.9, 12
    )
    returning id
  )
  insert into public.dress_variants (dress_id, size_label, bust_cm, waist_cm, hip_cm, shoulder_cm, length_cm, color, qty_on_hand)
  select d.id, x.size, x.bust, x.waist, x.hip, x.shoulder, x.length, 'champagne', 1
  from d, (values
    ('S'::text, 86::numeric, 68::numeric, 92::numeric, 36::numeric, 150::numeric),
    ('M'::text, 90::numeric, 72::numeric, 96::numeric, 37::numeric, 152::numeric),
    ('L'::text, 94::numeric, 76::numeric, 100::numeric, 38::numeric, 154::numeric)
  ) as x(size, bust, waist, hip, shoulder, length);

  -- Dress 2 — Senja Rose Kebaya Set
  with d as (
    insert into public.dresses (
      partner_id, title, slug, description, designer, category, sub_category,
      occasions, colors, primary_color, style_tags,
      daily_price_idr, retail_price_idr, deposit_idr,
      min_rental_days, max_rental_days,
      cover_image_url, status, rating_avg, rating_count
    ) values (
      v_partner,
      'Senja Rose Kebaya Set',
      'senja-rose-kebaya',
      'Kebaya modern dua-tone dengan sulaman bunga melati di bagian dada. Termasuk kain batik tulis dan selendang. Pas untuk tunangan, lamaran, dan acara adat.',
      'Atelier Mawar',
      'kebaya',
      'modern',
      array['engagement','wedding','traditional'],
      array['rose','dusty-pink','gold'],
      'rose',
      array['traditional','romantic'],
      450000, 4200000, 350000,
      1, 4,
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_900,h_1125/sample.jpg',
      'active', 4.7, 8
    )
    returning id
  )
  insert into public.dress_variants (dress_id, size_label, bust_cm, waist_cm, hip_cm, shoulder_cm, length_cm, color, qty_on_hand)
  select d.id, x.size, x.bust, x.waist, x.hip, x.shoulder, x.length, 'rose', 1
  from d, (values
    ('S'::text, 84::numeric, 66::numeric, 90::numeric, 35::numeric, 70::numeric),
    ('M'::text, 88::numeric, 70::numeric, 94::numeric, 36::numeric, 72::numeric)
  ) as x(size, bust, waist, hip, shoulder, length);

  -- Dress 3 — Noir Minimalist Cocktail
  with d as (
    insert into public.dresses (
      partner_id, title, slug, description, designer, category, sub_category,
      occasions, colors, primary_color, style_tags,
      daily_price_idr, retail_price_idr, deposit_idr,
      min_rental_days, max_rental_days,
      cover_image_url, status, rating_avg, rating_count
    ) values (
      v_partner,
      'Noir Minimalist Cocktail',
      'noir-minimalist-cocktail',
      'Dress hitam minimalis dengan potongan slip silk-blend dan back detail. Effortless untuk dinner, birthday party, atau pemotretan.',
      'Atelier Mawar',
      'dress',
      'cocktail',
      array['birthday','photoshoot','prom'],
      array['black'],
      'black',
      array['minimalist','editorial'],
      350000, 2800000, 250000,
      1, 7,
      'https://res.cloudinary.com/demo/image/upload/c_fill,w_900,h_1125/sample.jpg',
      'active', 4.6, 15
    )
    returning id
  )
  insert into public.dress_variants (dress_id, size_label, bust_cm, waist_cm, hip_cm, shoulder_cm, length_cm, color, qty_on_hand)
  select d.id, x.size, x.bust, x.waist, x.hip, x.shoulder, x.length, 'black', 1
  from d, (values
    ('S'::text, 84::numeric, 66::numeric, 90::numeric, 35::numeric, 95::numeric),
    ('M'::text, 88::numeric, 70::numeric, 94::numeric, 36::numeric, 97::numeric),
    ('L'::text, 92::numeric, 74::numeric, 98::numeric, 37::numeric, 99::numeric)
  ) as x(size, bust, waist, hip, shoulder, length);

  raise notice 'Seed complete: 1 partner, 3 dresses with variants. You are admin.';
end $$;
