-- ============================================================================
-- create_booking_tx — atomic booking creation.
-- ============================================================================
-- Holds the dates by inserting into variant_unavailable_dates inside the same
-- transaction. The unique PK (variant_id, unavail_date) is what prevents
-- double-booking under concurrency: two simultaneous bookings for the same
-- variant + date collide on the unique constraint, and one rolls back.
--
-- Returns the new booking_id + booking_code on success.
-- Raises an exception (caller catches it) on conflict or invalid input.
-- ============================================================================

create or replace function public.create_booking_tx(
  p_customer_id        uuid,
  p_variant_id         uuid,
  p_start              date,
  p_end                date,
  p_fulfillment        text,
  p_shipping_address   text,
  p_shipping_city      city_code,
  p_shipping_fee_idr   int,
  p_customer_notes     text
)
returns table (booking_id uuid, booking_code text)
language plpgsql
security definer
as $$
declare
  v_dress         public.dresses%rowtype;
  v_partner       public.partners%rowtype;
  v_days          int;
  v_rental_sub    int;
  v_service_fee   int;
  v_commission    int;
  v_partner_pay   int;
  v_total         int;
  v_booking_id    uuid;
  v_booking_code  text;
  v_iter          date;
begin
  -- Basic validation
  if p_start is null or p_end is null or p_end < p_start then
    raise exception 'invalid_date_range';
  end if;
  if p_fulfillment not in ('pickup', 'shipping') then
    raise exception 'invalid_fulfillment';
  end if;

  v_days := (p_end - p_start) + 1;

  -- Load + lock the dress + partner via the variant.
  select d.* into v_dress
  from public.dress_variants v
  join public.dresses d on d.id = v.dress_id
  where v.id = p_variant_id
  for update of d;

  if not found then
    raise exception 'variant_not_found';
  end if;
  if v_dress.status <> 'active' then
    raise exception 'dress_inactive';
  end if;
  if v_days < coalesce(v_dress.min_rental_days, 1) then
    raise exception 'too_few_days';
  end if;
  if v_days > coalesce(v_dress.max_rental_days, 7) then
    raise exception 'too_many_days';
  end if;

  select * into v_partner from public.partners where id = v_dress.partner_id;
  if not found or v_partner.status <> 'active' then
    raise exception 'partner_inactive';
  end if;

  -- Compute totals (mirror of lib/pricing.ts — keep in sync).
  v_rental_sub  := v_dress.daily_price_idr * v_days;
  v_service_fee := round(v_rental_sub * 0.03);
  v_commission  := round(v_rental_sub * v_partner.commission_pct / 100);
  v_partner_pay := v_rental_sub - v_commission;
  v_total       := v_rental_sub + v_service_fee + coalesce(p_shipping_fee_idr, 0) + coalesce(v_dress.deposit_idr, 0);

  -- Insert the booking. The trigger generates booking_code.
  insert into public.bookings (
    customer_id, partner_id, dress_id, variant_id,
    start_date, end_date, rental_days,
    rental_subtotal_idr, deposit_idr, shipping_fee_idr, service_fee_idr,
    total_idr, commission_idr, partner_payout_idr,
    fulfillment, shipping_address, shipping_city,
    status, deposit_status, deposit_held_idr,
    customer_notes
  ) values (
    p_customer_id, v_partner.id, v_dress.id, p_variant_id,
    p_start, p_end, v_days,
    v_rental_sub, coalesce(v_dress.deposit_idr, 0), coalesce(p_shipping_fee_idr, 0), v_service_fee,
    v_total, v_commission, v_partner_pay,
    p_fulfillment, p_shipping_address, p_shipping_city,
    'pending_payment',
    case when coalesce(v_dress.deposit_idr, 0) > 0 then 'held'::deposit_status else 'not_required'::deposit_status end,
    0,  -- nothing actually held yet; the hold ledger entry happens on payment confirm
    p_customer_notes
  )
  returning id, booking_code into v_booking_id, v_booking_code;

  -- Insert one unavail row per date in the range. The unique constraint on
  -- (variant_id, unavail_date) is the concurrency guard: a duplicate raises
  -- unique_violation, the whole tx rolls back, and the caller sees a clean error.
  v_iter := p_start;
  while v_iter <= p_end loop
    insert into public.variant_unavailable_dates (variant_id, unavail_date, booking_id, reason)
    values (p_variant_id, v_iter, v_booking_id, 'booked');
    v_iter := v_iter + 1;
  end loop;

  return query select v_booking_id, v_booking_code;
end;
$$;

grant execute on function public.create_booking_tx(
  uuid, uuid, date, date, text, text, city_code, int, text
) to authenticated;

-- ============================================================================
-- confirm_booking_payment — admin marks a pending booking as paid + holds deposit.
-- ============================================================================
create or replace function public.confirm_booking_payment(
  p_booking_id uuid,
  p_admin_id   uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_booking public.bookings%rowtype;
  v_deposit int;
begin
  -- Authorization: caller must be an admin.
  if not exists (select 1 from public.profiles where id = p_admin_id and role = 'admin') then
    raise exception 'not_authorized';
  end if;

  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'booking_not_found'; end if;
  if v_booking.status <> 'pending_payment' then
    raise exception 'invalid_status_%', v_booking.status;
  end if;

  v_deposit := coalesce(v_booking.deposit_idr, 0);

  update public.bookings
  set status = 'confirmed',
      deposit_held_idr = v_deposit,
      deposit_status = case when v_deposit > 0 then 'held'::deposit_status else 'not_required'::deposit_status end
  where id = p_booking_id;

  -- Insert payment marker (manual).
  insert into public.payments (booking_id, provider, amount_idr, method, status, paid_at)
  values (p_booking_id, 'manual', v_booking.total_idr, 'transfer', 'paid', now());

  -- Deposit ledger hold entry.
  if v_deposit > 0 then
    insert into public.deposit_ledger (booking_id, entry_type, amount_idr, reason, created_by)
    values (p_booking_id, 'hold', v_deposit, 'payment confirmed by admin', p_admin_id);
  end if;
end;
$$;

grant execute on function public.confirm_booking_payment(uuid, uuid) to authenticated;

-- ============================================================================
-- auto_cancel_stale_bookings — release unpaid bookings older than 30 minutes.
-- Called from the Vercel cron at /api/cron/auto-cancel.
-- ============================================================================
create or replace function public.auto_cancel_stale_bookings()
returns int
language plpgsql
security definer
as $$
declare
  v_count int := 0;
  v_id uuid;
begin
  for v_id in
    select id from public.bookings
    where status = 'pending_payment'
      and created_at < now() - interval '30 minutes'
  loop
    update public.bookings
    set status = 'cancelled', cancellation_reason = 'payment_timeout'
    where id = v_id;
    delete from public.variant_unavailable_dates where booking_id = v_id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

grant execute on function public.auto_cancel_stale_bookings() to service_role;
