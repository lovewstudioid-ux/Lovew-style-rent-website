import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusPill, DepositPill } from "@/components/booking/status-pill";
import { Button } from "@/components/ui/button";
import { confirmBookingPaymentAction } from "@/app/actions/bookings";
import { markDepositRefunded } from "@/app/actions/admin-deposits";

export const metadata = { title: "Detail booking · Admin" };

export default async function AdminBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, deposit_status,
      start_date, end_date, rental_days,
      rental_subtotal_idr, service_fee_idr, shipping_fee_idr,
      deposit_idr, deposit_held_idr, deposit_refunded_idr, deposit_withheld_idr,
      total_idr, fulfillment, shipping_address, shipping_city,
      customer_notes, partner_notes, created_at, updated_at,
      dresses ( title, slug, partners ( slug, brand_name, whatsapp ) ),
      dress_variants ( size_label, color, bust_cm, waist_cm, hip_cm ),
      profiles!bookings_customer_id_fkey ( id, full_name, phone )
    `,
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!booking) notFound();

  const { data: ledger } = await supabase
    .from("deposit_ledger")
    .select("entry_type, amount_idr, reason, created_at")
    .eq("booking_id", params.id)
    .order("created_at", { ascending: true });

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
  const customer = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
  const awaiting = booking.partner_notes === "AWAITING_CONFIRMATION";

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/bookings" className="text-xs text-rose-gold hover:underline">
          ← Booking
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-charcoal">
            {dress?.title}
          </h1>
          <StatusPill status={booking.status} t={t.status} />
          <DepositPill status={booking.deposit_status} t={t.deposit} />
          {awaiting ? (
            <span className="rounded-full bg-rose-gold/15 px-2 py-0.5 text-xs font-medium text-rose-gold">
              Customer klaim sudah bayar
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-charcoal/60">
          {partner?.brand_name} · <span className="font-mono">{booking.booking_code}</span> ·{" "}
          {formatDate(booking.created_at)}
        </p>
      </header>

      {/* Mark deposit refunded — admin's main job after the auto-refund window opens */}
      {booking.deposit_status === "refund_pending" ? (
        <div className="rounded-2xl border border-sage/40 bg-sage/10 p-5">
          <p className="text-sm text-charcoal">
            Deposit untuk booking ini sudah jatuh tempo untuk di-refund. Setelah
            kamu transfer manual dari rekening escrow ke customer, klik di bawah —
            sistem akan tulis entri refund di ledger dan tandai{" "}
            <strong>Refund selesai</strong>.
          </p>
          <form
            action={async (formData) => {
              "use server";
              await markDepositRefunded(formData);
            }}
            className="mt-4"
          >
            <input type="hidden" name="booking_id" value={booking.id} />
            <Button type="submit" size="lg">
              Tandai sudah refund
            </Button>
          </form>
        </div>
      ) : null}

      {/* Confirm payment CTA (admin's main job in pending_payment) */}
      {booking.status === "pending_payment" ? (
        <div className="rounded-2xl border border-rose-gold/30 bg-rose-gold/10 p-5">
          <p className="text-sm text-charcoal">
            Booking ini menunggu konfirmasi pembayaran. Setelah verifikasi
            transfer di rekening LOVEW, klik tombol di bawah — sistem akan
            menahan deposit secara otomatis dan mengubah status jadi{" "}
            <strong>Dikonfirmasi</strong>.
          </p>
          <form
            action={async (formData) => {
              "use server";
              await confirmBookingPaymentAction(formData);
            }}
            className="mt-4"
          >
            <input type="hidden" name="booking_id" value={booking.id} />
            <Button type="submit" size="lg">
              Konfirmasi pembayaran
            </Button>
          </form>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: customer + booking + pricing */}
        <div className="space-y-6">
          <Card title="Customer">
            <p className="font-medium text-charcoal">{customer?.full_name ?? "—"}</p>
            <p className="text-xs text-charcoal/60">{customer?.phone ?? "—"}</p>
          </Card>

          <Card title="Booking">
            <Row label="Variant" value={`${variant?.size_label}${variant?.color ? ` · ${variant.color}` : ""}`} />
            <Row
              label="Tanggal"
              value={`${formatDate(booking.start_date)} – ${formatDate(booking.end_date)} (${booking.rental_days} hari)`}
            />
            <Row
              label={tc.fulfillmentLabel}
              value={
                booking.fulfillment === "shipping"
                  ? `${tc.fulfillmentShipping}${booking.shipping_city ? ` · ${booking.shipping_city}` : ""}`
                  : tc.fulfillmentPickup
              }
            />
            {booking.shipping_address ? (
              <Row label="Alamat kirim" value={booking.shipping_address} />
            ) : null}
            {booking.customer_notes ? (
              <Row label="Catatan customer" value={booking.customer_notes} />
            ) : null}
          </Card>

          <Card title="Pricing">
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
            <div className="mt-2 flex items-center justify-between border-t border-charcoal/10 pt-2 font-semibold text-charcoal">
              <span>{tc.total}</span>
              <span>{formatIDR(booking.total_idr)}</span>
            </div>
          </Card>

          <Card title="Deposit ledger">
            {!ledger || ledger.length === 0 ? (
              <p className="text-sm text-charcoal/60">Belum ada entri.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-charcoal/50">
                  <tr>
                    <th className="py-1 pr-3">Jenis</th>
                    <th className="py-1 pr-3">Jumlah</th>
                    <th className="py-1 pr-3">Alasan</th>
                    <th className="py-1 pr-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10">
                  {ledger.map((row, i) => (
                    <tr key={i}>
                      <td className="py-1 pr-3 capitalize">{row.entry_type}</td>
                      <td className="py-1 pr-3">
                        {row.entry_type === "hold" ? "+" : "−"}
                        {formatIDR(Math.abs(row.amount_idr))}
                      </td>
                      <td className="py-1 pr-3 text-charcoal/70">{row.reason ?? "—"}</td>
                      <td className="py-1 pr-3 text-charcoal/60">
                        {formatDate(row.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Right: partner sidebar */}
        <aside className="space-y-3">
          {partner ? (
            <Card title="Partner">
              <p className="font-medium text-charcoal">{partner.brand_name}</p>
              {partner.whatsapp ? (
                <p className="text-xs text-charcoal/60">{partner.whatsapp}</p>
              ) : null}
              {dress?.slug ? (
                <Link
                  href={`/d/${partner.slug}/${dress.slug}`}
                  className="mt-2 inline-flex text-xs text-rose-gold hover:underline"
                >
                  Lihat dress →
                </Link>
              ) : null}
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-cream p-5">
      <p className="mb-3 text-xs uppercase tracking-widest text-charcoal/50">
        {title}
      </p>
      <div className="space-y-1.5 text-sm text-charcoal/80">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-widest text-charcoal/50">{label}</span>
      <span className="text-right text-charcoal">{value}</span>
    </div>
  );
}
