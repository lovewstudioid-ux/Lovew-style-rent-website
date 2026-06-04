import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusPill, DepositPill } from "@/components/booking/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  markBookingInUse,
  markBookingReturned,
  markBookingCompleted,
  fileDamageClaim,
} from "@/app/actions/partner-bookings";

export const metadata = { title: "Detail booking · Partner" };

export default async function PartnerBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify partner ownership by joining partners.owner_user_id.
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, deposit_status,
      start_date, end_date, rental_days,
      rental_subtotal_idr, deposit_idr, deposit_held_idr,
      total_idr, partner_payout_idr, commission_idr,
      fulfillment, shipping_address, shipping_city,
      customer_notes, created_at,
      dresses ( id, title, slug, cover_image_url ),
      dress_variants ( size_label, color, bust_cm, waist_cm, hip_cm ),
      profiles!bookings_customer_id_fkey ( full_name, phone ),
      partners ( id, owner_user_id, brand_name )
    `,
    )
    .eq("id", params.id)
    .maybeSingle();
  if (!booking) notFound();

  const partner = Array.isArray(booking.partners) ? booking.partners[0] : booking.partners;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";
  if (!isAdmin && partner?.owner_user_id !== user.id) notFound();

  const dress = Array.isArray(booking.dresses) ? booking.dresses[0] : booking.dresses;
  const variant = Array.isArray(booking.dress_variants)
    ? booking.dress_variants[0]
    : booking.dress_variants;
  const customer = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;

  // Mask customer info until status is in_use (privacy: partner only needs it then).
  const showFullCustomer = ["in_use", "returned", "completed"].includes(booking.status);
  const customerName = customer?.full_name ?? "—";
  const maskedName = showFullCustomer
    ? customerName
    : customerName.split(" ").map((w) => `${w.charAt(0)}***`).join(" ");
  const maskedPhone = showFullCustomer ? customer?.phone : null;

  const t = getDictionary(defaultLocale);
  const tp = t.partner.bookings;
  const tb = t.bookings;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link href="/partner/bookings" className="text-xs text-rose-gold hover:underline">
          ← Kembali ke booking
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-charcoal">
            {dress?.title}
          </h1>
          <StatusPill status={booking.status} t={tb.status} />
          <DepositPill status={booking.deposit_status} t={tb.deposit} />
        </div>
        <p className="text-xs text-charcoal/60">
          <span className="font-mono">{booking.booking_code}</span> · {formatDate(booking.created_at)}
        </p>
      </header>

      {/* Action zone */}
      <ActionZone booking={booking} t={tp} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: details */}
        <div className="space-y-6">
          <Card title="Customer">
            <p className="font-medium text-charcoal">{maskedName}</p>
            <p className="text-xs text-charcoal/60">
              {maskedPhone ?? "Akan terlihat saat status Sedang dipakai"}
            </p>
          </Card>

          <Card title="Booking">
            <Row label="Variant" value={`${variant?.size_label}${variant?.color ? ` · ${variant.color}` : ""}`} />
            <Row label="Tanggal" value={`${formatDate(booking.start_date)} – ${formatDate(booking.end_date)} (${booking.rental_days} hari)`} />
            <Row
              label="Pengambilan"
              value={
                booking.fulfillment === "shipping"
                  ? `Kirim · ${booking.shipping_city ?? ""}`
                  : "Ambil di tempat"
              }
            />
            {booking.shipping_address ? (
              <Row label="Alamat" value={booking.shipping_address} />
            ) : null}
            {booking.customer_notes ? (
              <Row label="Catatan customer" value={booking.customer_notes} />
            ) : null}
          </Card>

          <Card title="Payout">
            <Row label="Rental" value={formatIDR(booking.rental_subtotal_idr)} />
            <Row label="Komisi LOVEW" value={`− ${formatIDR(booking.commission_idr)}`} />
            <div className="mt-1 flex items-center justify-between border-t border-charcoal/10 pt-2 font-semibold text-charcoal">
              <span>Diterima partner</span>
              <span>{formatIDR(booking.partner_payout_idr)}</span>
            </div>
            <p className="mt-2 text-[11px] text-charcoal/50">
              Payout dibayar mingguan setelah booking ditandai Selesai.
            </p>
          </Card>
        </div>

        {/* Right: dress + side actions */}
        <aside className="space-y-3">
          {dress ? (
            <Card title="Dress">
              <div className="flex items-center gap-3">
                {dress.cover_image_url ? (
                  <div className="relative h-16 w-12 overflow-hidden rounded-md bg-soft-blush">
                    <Image
                      src={dress.cover_image_url}
                      alt={dress.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                <Link
                  href={`/partner/catalog`}
                  className="text-sm text-rose-gold hover:underline"
                >
                  Kelola katalog →
                </Link>
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function ActionZone({
  booking,
  t,
}: {
  booking: {
    id: string;
    status: string;
    deposit_idr: number | null;
  };
  t: ReturnType<typeof getDictionary>["partner"]["bookings"];
}) {
  const id = booking.id;

  // Map status → primary action
  if (booking.status === "confirmed") {
    return (
      <FormAction action={markBookingInUse} id={id} label={t.markInUse} tone="primary" />
    );
  }
  if (booking.status === "in_use") {
    return (
      <FormAction action={markBookingReturned} id={id} label={t.markReturned} tone="primary" />
    );
  }
  if (booking.status === "returned") {
    return (
      <div className="space-y-3">
        <FormAction action={markBookingCompleted} id={id} label={t.markCompleted} tone="primary" />
        <details className="rounded-2xl border border-charcoal/10 bg-cream p-5">
          <summary className="cursor-pointer text-sm font-medium text-rose-gold">
            {t.fileClaim}
          </summary>
          <form
            action={async (formData) => {
              "use server";
              await fileDamageClaim(formData);
            }}
            className="mt-4 space-y-3"
          >
            <input type="hidden" name="booking_id" value={id} />
            <div className="space-y-1">
              <Label htmlFor="claimed_idr">{t.claimAmount}</Label>
              <Input
                id="claimed_idr"
                name="claimed_idr"
                type="number"
                inputMode="numeric"
                min="1"
                max={booking.deposit_idr ?? undefined}
                required
              />
              <p className="text-xs text-charcoal/50">
                Maksimal: Rp {(booking.deposit_idr ?? 0).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="reason">{t.claimReason}</Label>
              <select
                id="reason"
                name="reason"
                required
                className="flex h-11 w-full rounded-md border border-charcoal/20 bg-cream px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
              >
                <option value="stain">{t.claimReasonOptions.stain}</option>
                <option value="tear">{t.claimReasonOptions.tear}</option>
                <option value="late_return">{t.claimReasonOptions.late}</option>
                <option value="lost">{t.claimReasonOptions.lost}</option>
                <option value="other">{t.claimReasonOptions.other}</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">{t.claimDescription}</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold"
              />
            </div>
            <Button type="submit" variant="outline">
              {t.claimSubmit}
            </Button>
          </form>
        </details>
      </div>
    );
  }
  if (booking.status === "disputed") {
    return (
      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-4 text-sm text-charcoal">
        Klaim sedang ditinjau tim LOVEW. Kamu akan dapat notifikasi saat sudah diputuskan.
      </div>
    );
  }
  return null;
}

function FormAction({
  action,
  id,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<unknown>;
  id: string;
  label: string;
  tone: "primary" | "outline";
}) {
  return (
    <form
      action={async (formData) => {
        "use server";
        await action(formData);
      }}
      className="rounded-2xl border border-rose-gold/30 bg-rose-gold/10 p-5"
    >
      <input type="hidden" name="booking_id" value={id} />
      <Button type="submit" size="lg" variant={tone === "primary" ? "default" : "outline"}>
        {label}
      </Button>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-cream p-5">
      <p className="mb-3 text-xs uppercase tracking-widest text-charcoal/50">{title}</p>
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
