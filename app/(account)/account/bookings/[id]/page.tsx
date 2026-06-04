import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusPill, DepositPill } from "@/components/booking/status-pill";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Detail booking" };

export default async function CustomerBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/account/bookings/${params.id}`);

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, deposit_status,
      start_date, end_date, rental_days,
      rental_subtotal_idr, service_fee_idr, shipping_fee_idr,
      deposit_idr, deposit_held_idr, deposit_refunded_idr, deposit_withheld_idr,
      total_idr, fulfillment, shipping_address, shipping_city,
      customer_notes, created_at,
      dresses ( title, slug, cover_image_url, partners ( slug, brand_name, whatsapp ) ),
      dress_variants ( size_label, color )
    `,
    )
    .eq("id", params.id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!booking) notFound();

  const t = getDictionary(defaultLocale).bookings;
  const tc = getDictionary(defaultLocale).checkout;
  const dress = Array.isArray(booking.dresses) ? booking.dresses[0] : booking.dresses;
  const partner = dress
    ? Array.isArray(dress.partners)
      ? dress.partners[0]
      : dress.partners
    : null;
  const variant = Array.isArray(booking.dress_variants)
    ? booking.dress_variants[0]
    : booking.dress_variants;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/account/bookings" className="text-xs text-rose-gold hover:underline">
          ← Kembali ke booking
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-charcoal">
            {dress?.title}
          </h1>
          <StatusPill status={booking.status} t={t.status} />
          <DepositPill status={booking.deposit_status} t={t.deposit} />
        </div>
        <p className="text-xs text-charcoal/60">
          {partner?.brand_name} · <span className="font-mono">{booking.booking_code}</span>
        </p>
      </header>

      {booking.status === "pending_payment" ? (
        <div className="rounded-2xl border border-rose-gold/30 bg-rose-gold/10 px-5 py-4 text-sm text-charcoal">
          Pembayaran belum selesai. Lanjutkan sebelum 30 menit habis biar
          tanggalnya tidak dilepas.
          <Button asChild className="mt-3">
            <Link href={`/checkout/${booking.booking_code}/pay`}>
              Lanjutkan pembayaran
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Left: details */}
        <div className="space-y-6 rounded-2xl border border-charcoal/10 bg-cream p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-soft-blush">
              {dress?.cover_image_url ? (
                <Image
                  src={dress.cover_image_url}
                  alt={dress.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-charcoal/50">Variant</p>
              <p className="text-sm text-charcoal">
                {variant?.size_label}{variant?.color ? ` · ${variant.color}` : ""}
              </p>
              <p className="mt-3 text-xs text-charcoal/50">Tanggal</p>
              <p className="text-sm text-charcoal">
                {formatDate(booking.start_date)} – {formatDate(booking.end_date)}{" "}
                ({booking.rental_days} hari)
              </p>
              <p className="mt-3 text-xs text-charcoal/50">{tc.fulfillmentLabel}</p>
              <p className="text-sm text-charcoal">
                {booking.fulfillment === "shipping"
                  ? `${tc.fulfillmentShipping} · ${booking.shipping_city ?? ""}`
                  : tc.fulfillmentPickup}
              </p>
              {booking.fulfillment === "shipping" && booking.shipping_address ? (
                <p className="text-xs text-charcoal/60">{booking.shipping_address}</p>
              ) : null}
              {booking.customer_notes ? (
                <>
                  <p className="mt-3 text-xs text-charcoal/50">Catatan</p>
                  <p className="text-sm text-charcoal/80">{booking.customer_notes}</p>
                </>
              ) : null}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5 border-t border-charcoal/10 pt-4 text-sm text-charcoal/80">
            <Row label={tc.rentalLine} value={formatIDR(booking.rental_subtotal_idr)} />
            {(booking.service_fee_idr ?? 0) > 0 && (
              <Row label={tc.serviceLine} value={formatIDR(booking.service_fee_idr)} />
            )}
            {(booking.shipping_fee_idr ?? 0) > 0 && (
              <Row label={tc.shippingLine} value={formatIDR(booking.shipping_fee_idr)} />
            )}
            {(booking.deposit_idr ?? 0) > 0 && (
              <Row label={tc.depositLine} value={formatIDR(booking.deposit_idr)} />
            )}
            <div className="flex items-center justify-between border-t border-charcoal/10 pt-3 text-base font-semibold text-charcoal">
              <span>{tc.total}</span>
              <span>{formatIDR(booking.total_idr)}</span>
            </div>
          </div>

          {/* Deposit panel */}
          {(booking.deposit_idr ?? 0) > 0 ? (
            <div className="rounded-lg bg-soft-blush/40 p-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-charcoal/50">
                Status deposit
              </p>
              <div className="mt-2 space-y-1 text-charcoal/80">
                <Row label="Dipegang" value={formatIDR(booking.deposit_held_idr ?? 0)} />
                {(booking.deposit_refunded_idr ?? 0) > 0 && (
                  <Row label="Sudah refund" value={formatIDR(booking.deposit_refunded_idr)} />
                )}
                {(booking.deposit_withheld_idr ?? 0) > 0 && (
                  <Row label="Ditahan untuk klaim" value={formatIDR(booking.deposit_withheld_idr)} />
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: side actions */}
        <aside className="space-y-3">
          {partner?.whatsapp ? (
            <Button asChild variant="outline" size="lg" className="w-full">
              <a
                href={`https://wa.me/${partner.whatsapp}?text=${encodeURIComponent(
                  `Halo ${partner.brand_name}, saya ada booking ${booking.booking_code} di LOVEW Style.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat partner
              </a>
            </Button>
          ) : null}
          {dress && partner ? (
            <Button asChild variant="ghost" size="lg" className="w-full">
              <Link href={`/d/${partner.slug}/${dress.slug}`}>Lihat dress</Link>
            </Button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
