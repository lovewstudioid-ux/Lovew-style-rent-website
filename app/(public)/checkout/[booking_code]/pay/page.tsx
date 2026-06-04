import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { PaymentClient } from "@/components/payment/payment-client";
import { Countdown } from "@/components/payment/countdown";
import { markBookingPaidByCustomer } from "@/app/actions/bookings";

export const metadata = { title: "Selesaikan pembayaran" };

interface PageProps {
  params: { booking_code: string };
}

export default async function PayPage({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/sign-in?next=${encodeURIComponent(`/checkout/${params.booking_code}/pay`)}`,
    );
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, total_idr, created_at, partner_notes,
      start_date, end_date, rental_days,
      dresses ( title, slug, cover_image_url, partners ( slug, brand_name ) )
    `,
    )
    .eq("booking_code", params.booking_code)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!booking) notFound();

  const t = getDictionary(defaultLocale).payment;
  const dress = Array.isArray(booking.dresses) ? booking.dresses[0] : booking.dresses;
  const partner = dress
    ? Array.isArray(dress.partners)
      ? dress.partners[0]
      : dress.partners
    : null;

  const bank = {
    name: process.env.BANK_NAME ?? "BCA",
    account: process.env.BANK_ACCOUNT_NO ?? "0000000000",
    holder: process.env.BANK_ACCOUNT_HOLDER ?? "LOVEW Studio",
  };
  const whatsapp = process.env.LOVEW_WHATSAPP ?? "6281234567890";
  const expiresAt = new Date(new Date(booking.created_at).getTime() + 30 * 60_000).toISOString();
  const awaiting = booking.partner_notes === "AWAITING_CONFIRMATION";

  // States that aren't "still waiting for payment"
  if (booking.status === "cancelled") {
    return (
      <NoticeShell title={t.title} message={t.cancelled} cta={{ label: "Cari dress lain", href: "/browse" }} />
    );
  }
  if (booking.status !== "pending_payment") {
    return (
      <NoticeShell
        title={t.title}
        message="Pembayaran sudah dikonfirmasi. Lihat detailnya di Booking saya."
        cta={{ label: "Lihat booking", href: "/account/bookings" }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />

      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <header className="mb-6">
            <h1 className="font-display text-3xl font-semibold text-charcoal md:text-4xl">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-charcoal/70">{t.timeoutNote}</p>
          </header>

          {/* Booking ref + countdown */}
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-charcoal/10 bg-cream px-5 py-4">
            <div className="text-sm">
              <p className="text-xs uppercase tracking-widest text-charcoal/50">
                Kode booking
              </p>
              <p className="mt-1 font-mono text-lg text-charcoal">{booking.booking_code}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs uppercase tracking-widest text-charcoal/50">
                {t.timeoutBadge}
              </p>
              <p className="mt-1 font-mono text-lg text-rose-gold" suppressHydrationWarning>
                <Countdown expiresAt={expiresAt} />
              </p>
            </div>
          </div>

          {awaiting ? (
            <div className="mb-6 rounded-md border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-charcoal">
              {t.awaiting}
            </div>
          ) : null}

          {/* Payment options */}
          <PaymentClient
            t={t}
            amount={booking.total_idr}
            bookingCode={booking.booking_code}
            bank={bank}
          />

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <form
              action={async (formData) => {
                "use server";
                await markBookingPaidByCustomer(formData);
              }}
            >
              <input type="hidden" name="booking_code" value={booking.booking_code} />
              <Button type="submit" size="lg" disabled={awaiting}>
                {awaiting ? t.awaiting.slice(0, 36) + "…" : t.paidCta}
              </Button>
            </form>
            <Button asChild variant="outline" size="lg">
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `Halo LOVEW, saya butuh bantuan untuk booking ${booking.booking_code}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                {t.whatsappCta}
              </a>
            </Button>
          </div>

          {/* Small dress summary */}
          {dress ? (
            <div className="mt-12 rounded-2xl border border-charcoal/10 bg-cream p-5">
              <div className="flex items-start gap-4">
                {dress.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dress.cover_image_url}
                    alt={dress.title}
                    className="h-20 w-16 rounded-md object-cover"
                  />
                ) : null}
                <div className="flex-1">
                  <p className="font-display text-lg text-charcoal">{dress.title}</p>
                  <p className="text-xs text-charcoal/60">
                    {partner?.brand_name} · {booking.rental_days} hari
                  </p>
                  <p className="mt-1 text-xs text-charcoal/60">
                    {booking.start_date} – {booking.end_date}
                  </p>
                </div>
                {partner?.slug ? (
                  <Link
                    href={`/d/${partner.slug}/${dress.slug}`}
                    className="text-xs text-rose-gold hover:underline"
                  >
                    Lihat
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <SiteFooter locale={defaultLocale} />
    </div>
  );
}

function NoticeShell({
  title,
  message,
  cta,
}: {
  title: string;
  message: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold text-charcoal">{title}</h1>
          <p className="mt-3 text-charcoal/70">{message}</p>
          <Button asChild className="mt-6">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter locale={defaultLocale} />
    </div>
  );
}

