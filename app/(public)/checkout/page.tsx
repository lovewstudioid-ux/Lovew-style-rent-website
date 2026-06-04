import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calcBookingPrice } from "@/lib/pricing";
import { formatIDR, formatDate } from "@/lib/format";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBooking } from "@/app/actions/bookings";

export const metadata = { title: "Konfirmasi booking" };

function diffDaysInclusive(start: string, end: string): number {
  const s = new Date(start + "T00:00:00Z").getTime();
  const e = new Date(end + "T00:00:00Z").getTime();
  if (e < s) return 0;
  return Math.round((e - s) / 86_400_000) + 1;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { variant?: string; start?: string; end?: string; error?: string };
}) {
  const variantId = searchParams.variant ?? "";
  const start = searchParams.start ?? "";
  const end = searchParams.end ?? "";

  if (!variantId || !start || !end) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/sign-in?next=${encodeURIComponent(`/checkout?variant=${variantId}&start=${start}&end=${end}`)}`,
    );
  }

  // Load variant + dress + partner.
  const { data: variant } = await supabase
    .from("dress_variants")
    .select(
      `
      id, size_label, color,
      dresses!inner (
        id, title, slug, daily_price_idr, deposit_idr, cover_image_url,
        min_rental_days, max_rental_days, status,
        partners!inner ( id, slug, brand_name, city, status, shipping_available, shipping_cities, commission_pct )
      )
    `,
    )
    .eq("id", variantId)
    .maybeSingle();

  if (!variant) notFound();
  const dress = Array.isArray(variant.dresses) ? variant.dresses[0] : variant.dresses;
  if (!dress || dress.status !== "active") notFound();
  const partner = Array.isArray(dress.partners) ? dress.partners[0] : dress.partners;
  if (!partner || partner.status !== "active") notFound();

  // Date validation
  const days = diffDaysInclusive(start, end);
  if (days <= 0) notFound();
  const minDays = dress.min_rental_days ?? 1;
  const maxDays = dress.max_rental_days ?? 7;

  // Profile prefill
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, city")
    .eq("id", user.id)
    .maybeSingle();

  // Conflict check
  const { data: conflicts } = await supabase
    .from("variant_unavailable_dates")
    .select("unavail_date")
    .eq("variant_id", variantId)
    .gte("unavail_date", start)
    .lte("unavail_date", end)
    .limit(1);
  const conflict = (conflicts?.length ?? 0) > 0;

  const t = getDictionary(defaultLocale).checkout;
  const breakdown = calcBookingPrice({
    lines: [{ dailyRate: dress.daily_price_idr, days }],
    deposit: dress.deposit_idr ?? 0,
    shippingFee: 0,
  });
  // Add service fee (3% of rental subtotal) — kept here, since lib/pricing.ts
  // doesn't include it; the SQL function add it too.
  const serviceFee = Math.round(breakdown.rentalSubtotal * 0.03);
  const customerTotal = breakdown.total + serviceFee;

  const canShip =
    partner.shipping_available &&
    Array.isArray(partner.shipping_cities) &&
    partner.shipping_cities.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />

      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-charcoal md:text-4xl">
              {t.title}
            </h1>
          </header>

          {searchParams.error ? (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {searchParams.error}
            </div>
          ) : null}
          {conflict ? (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {t.unavailable}
            </div>
          ) : null}
          {days < minDays && (
            <div className="mb-6 rounded-md border border-rose-gold/30 bg-rose-gold/10 px-4 py-3 text-sm text-charcoal">
              {t.minDays}: {minDays} hari
            </div>
          )}
          {days > maxDays && (
            <div className="mb-6 rounded-md border border-rose-gold/30 bg-rose-gold/10 px-4 py-3 text-sm text-charcoal">
              {t.maxDays}: {maxDays} hari
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-[1fr_360px]">
            {/* Form */}
            <form
              action={async (formData) => {
                "use server";
                const res = await createBooking(formData);
                const { redirect: r } = await import("next/navigation");
                if (res && "ok" in res && res.ok === false) {
                  const params = new URLSearchParams({
                    variant: variantId,
                    start,
                    end,
                    error: res.error,
                  });
                  r(`/checkout?${params.toString()}`);
                }
              }}
              className="space-y-6 rounded-2xl border border-charcoal/10 bg-cream p-6"
            >
              <input type="hidden" name="variant_id" value={variantId} />
              <input type="hidden" name="start" value={start} />
              <input type="hidden" name="end" value={end} />
              <input type="hidden" name="shipping_fee_idr" value="0" />

              <div className="space-y-2">
                <Label>{t.fulfillmentLabel}</Label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-charcoal/15 px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name="fulfillment"
                      value="pickup"
                      defaultChecked
                      className="h-4 w-4 text-rose-gold focus:ring-rose-gold"
                    />
                    {t.fulfillmentPickup}
                  </label>
                  {canShip ? (
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-charcoal/15 px-3 py-2 text-sm">
                      <input
                        type="radio"
                        name="fulfillment"
                        value="shipping"
                        className="h-4 w-4 text-rose-gold focus:ring-rose-gold"
                      />
                      {t.fulfillmentShipping}
                    </label>
                  ) : null}
                </div>
              </div>

              {canShip ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_address">{t.shippingAddressLabel}</Label>
                    <textarea
                      id="shipping_address"
                      name="shipping_address"
                      rows={2}
                      className="flex w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_city">{t.shippingCityLabel}</Label>
                    <select
                      id="shipping_city"
                      name="shipping_city"
                      className="flex h-11 w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                    >
                      <option value="">—</option>
                      {(partner.shipping_cities as string[]).map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="phone">{t.phoneLabel}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="0812xxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_notes">{t.notesLabel}</Label>
                <textarea
                  id="customer_notes"
                  name="customer_notes"
                  rows={3}
                  placeholder={t.notesHint}
                  className="flex w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-charcoal/80">
                <input
                  type="checkbox"
                  name="agreement"
                  required
                  className="mt-1 h-4 w-4 rounded border-charcoal/30 text-rose-gold focus:ring-rose-gold"
                />
                <span>{t.agreementLabel}</span>
              </label>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={conflict || days < minDays || days > maxDays}
              >
                {t.submit}
              </Button>
            </form>

            {/* Summary */}
            <aside className="space-y-4 rounded-2xl border border-charcoal/10 bg-cream p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-charcoal/50">
                  {t.summary}
                </p>
                <div className="mt-3 flex items-start gap-3">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-soft-blush">
                    {dress.cover_image_url ? (
                      // Keep <img> here so summary is robust to next/image config issues.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dress.cover_image_url}
                        alt={dress.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-display text-base text-charcoal">{dress.title}</p>
                    <p className="text-charcoal/60">
                      {partner.brand_name} · {variant.size_label}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-charcoal/60">
                  {formatDate(start)} – {formatDate(end)} ({days} {t.daysLine})
                </p>
              </div>

              <div className="space-y-1.5 border-t border-charcoal/10 pt-4 text-sm text-charcoal/80">
                <Row label={`${t.rentalLine} (${days} × ${formatIDR(dress.daily_price_idr)})`} value={formatIDR(breakdown.rentalSubtotal)} />
                <Row label={t.serviceLine} value={formatIDR(serviceFee)} />
                {breakdown.deposit > 0 ? (
                  <Row label={t.depositLine} value={formatIDR(breakdown.deposit)} tooltip={t.depositTooltip} />
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4 text-base font-semibold text-charcoal">
                <span>{t.total}</span>
                <span>{formatIDR(customerTotal)}</span>
              </div>

              <Link
                href={`/d/${partner.slug}/${dress.slug}`}
                className="block text-center text-xs text-rose-gold hover:underline"
              >
                ← Kembali ke detail dress
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter locale={defaultLocale} />
    </div>
  );
}

function Row({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span title={tooltip}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
