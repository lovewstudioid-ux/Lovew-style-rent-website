-- ============================================================================
-- search_dresses — main catalog query, called from /browse via Supabase RPC.
-- ============================================================================
-- Returns one row per matching dress, joined with the partner and a chosen
-- thumbnail variant. Excludes dresses whose ALL variants are unavailable in
-- the requested date range. Pagination via p_limit / p_offset.
--
-- "Fits my size" (p_fits_user_id) uses the user's default sizing_profile,
-- matching variants whose bust/waist/hip are within ±3 cm of the profile.
-- ============================================================================

create or replace function public.search_dresses(
  p_city          city_code      default null,
  p_start         date           default null,
  p_end           date           default null,
  p_categories    text[]         default null,
  p_occasions     text[]         default null,
  p_colors        text[]         default null,
  p_size          text           default null,
  p_min_price     int            default null,
  p_max_price     int            default null,
  p_fits_user_id  uuid           default null,
  p_sort          text           default 'relevance',
  p_limit         int            default 24,
  p_offset        int            default 0
)
returns table (
  id                uuid,
  slug              text,
  title             text,
  cover_image_url   text,
  daily_price_idr   int,
  deposit_idr       int,
  primary_color     text,
  category          text,
  rating_avg        numeric,
  rating_count      int,
  created_at        timestamptz,
  partner_id        uuid,
  partner_slug      text,
  partner_brand     text,
  partner_city      city_code,
  total_count       bigint
)
language plpgsql
stable
as $$
declare
  v_tol numeric := 3.0;  -- cm tolerance for "fits my size"
begin
  return query
  with profile_sz as (
    select bust_cm, waist_cm, hip_cm
    from public.sizing_profiles
    where p_fits_user_id is not null
      and user_id = p_fits_user_id
      and is_default = true
    limit 1
  ),
  candidates as (
    select
      d.id,
      d.slug,
      d.title,
      d.cover_image_url,
      d.daily_price_idr,
      d.deposit_idr,
      d.primary_color,
      d.category,
      d.colors,
      d.occasions,
      d.rating_avg,
      d.rating_count,
      d.created_at,
      p.id            as partner_id,
      p.slug          as partner_slug,
      p.brand_name    as partner_brand,
      p.city          as partner_city
    from public.dresses d
    join public.partners p on p.id = d.partner_id
    where d.status = 'active'
      and p.status = 'active'
      and (p_city is null      or p.city = p_city)
      and (p_categories is null or d.category = any(p_categories))
      and (p_occasions  is null or d.occasions && p_occasions)
      and (p_colors     is null or d.colors    && p_colors)
      and (p_min_price  is null or d.daily_price_idr >= p_min_price)
      and (p_max_price  is null or d.daily_price_idr <= p_max_price)
      -- At least one variant matches size + availability + fit constraints.
      and exists (
        select 1
        from public.dress_variants v
        where v.dress_id = d.id
          and (p_size is null or v.size_label = p_size)
          and (
            p_start is null or p_end is null
            or not exists (
              select 1 from public.variant_unavailable_dates u
              where u.variant_id = v.id
                and u.unavail_date between p_start and p_end
            )
          )
          and (
            p_fits_user_id is null
            or not exists (select 1 from profile_sz)  -- no profile = pass-through
            or (
              (v.bust_cm  is null or abs(v.bust_cm  - (select bust_cm  from profile_sz)) <= v_tol)
              and (v.waist_cm is null or abs(v.waist_cm - (select waist_cm from profile_sz)) <= v_tol)
              and (v.hip_cm   is null or abs(v.hip_cm   - (select hip_cm   from profile_sz)) <= v_tol)
            )
          )
      )
  ),
  counted as (
    select c.*, count(*) over () as total_count
    from candidates c
  )
  select
    c.id, c.slug, c.title, c.cover_image_url, c.daily_price_idr, c.deposit_idr,
    c.primary_color, c.category, c.rating_avg, c.rating_count, c.created_at,
    c.partner_id, c.partner_slug, c.partner_brand, c.partner_city, c.total_count
  from counted c
  order by
    case when p_sort = 'price_asc'  then c.daily_price_idr end asc nulls last,
    case when p_sort = 'price_desc' then c.daily_price_idr end desc nulls last,
    case when p_sort = 'newest'     then c.created_at      end desc nulls last,
    case when p_sort = 'rating'     then c.rating_avg      end desc nulls last,
    -- Default "relevance": rating, then view-count proxy via newest.
    c.rating_avg desc nulls last,
    c.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- Make the function callable via PostgREST / supabase-js .rpc()
grant execute on function public.search_dresses(
  city_code, date, date, text[], text[], text[], text, int, int, uuid, text, int, int
) to anon, authenticated;
