import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDressBySlug, getWishlistIds } from "@/lib/catalog";
import { formatIDR } from "@/lib/format";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DressGallery } from "@/components/dress/dress-gallery";
import { DressActions, type VariantOption } from "@/components/dress/dress-actions";
import { WishlistButton } from "@/components/dress/wishlist-button";

interface PageProps {
  params: { partner_slug: string; dress_slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const dress = await getDressBySlug(params.partner_slug, params.dress_slug);
  if (!dress) return { title: "Tidak ditemukan" };
  return { title: dress.title };
}

export default async function DressDetailPage({ params }: PageProps) {
  const dress = await getDressBySlug(params.partner_slug, params.dress_slug);
  if (!dress) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Default sizing for "Fits my size" badge.
  let userSizing: { bust_cm: number | null; waist_cm: number | null; hip_cm: number | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("sizing_profiles")
      .select("bust_cm, waist_cm, hip_cm")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();
    userSizing = data ?? null;
  }

  const wishlistIds = await getWishlistIds(user?.id ?? null);
  const isWishlisted = wishlistIds.has(dress.id);

  // Pre-fetch the next 90 days of unavailable dates per variant so the
  // client-side date picker can validate without round-trips.
  const variants = (dress.dress_variants ?? []) as VariantOption[];
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 90);
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);

  const unavailableByVariant: Record<string, string[]> = {};
  if (variants.length > 0) {
    const { data: unavail } = await supabase
      .from("variant_unavailable_dates")
      .select("variant_id, unavail_date")
      .in("variant_id", variants.map((v) => v.id))
      .gte("unavail_date", fromIso)
      .lte("unavail_date", toIso);
    for (const row of unavail ?? []) {
      const id = (row as { variant_id: string }).variant_id;
      const day = (row as { unavail_date: string }).unavail_date;
      if (!unavailableByVariant[id]) unavailableByVariant[id] = [];
      unavailableByVariant[id].push(day);
    }
  }

  const t = getDictionary(defaultLocale);
  const tDetail = t.catalog.detail;

  // Sort images by sort_order.
  type ImgRow = { id: string; url: string; alt_text: string | null; sort_order: number | null };
  const images = ((dress.dress_images ?? []) as ImgRow[]).sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  if (images.length === 0 && dress.cover_image_url) {
    images.push({ id: "cover", url: dress.cover_image_url, alt_text: dress.title, sort_order: 0 });
  }

  const partner = Array.isArray(dress.partners) ? dress.partners[0] : dress.partners;
  const cityLabel =
    partner?.city ? partner.city.charAt(0).toUpperCase() + partner.city.slice(1) : "";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />

      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-charcoal/50">
            <Link href="/" className="hover:text-rose-gold">Beranda</Link>
            <span>/</span>
            <Link href="/browse" className="hover:text-rose-gold">Koleksi</Link>
            <span>/</span>
            <Link href={`/p/${partner?.slug}`} className="hover:text-rose-gold">{partner?.brand_name}</Link>
            <span>/</span>
            <span className="text-charcoal/70">{dress.title}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2">
            {/* Gallery */}
            <DressGallery images={images} title={dress.title} />

            {/* Info panel */}
            <div className="space-y-6">
              <div>
                <Link
                  href={`/p/${partner?.slug}`}
                  className="text-[10px] uppercase tracking-widest text-sage hover:text-rose-gold"
                >
                  {partner?.brand_name}
                </Link>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <h1 className="font-display text-3xl font-semibold text-charcoal md:text-4xl">
                    {dress.title}
                  </h1>
                  <WishlistButton dressId={dress.id} isWishlisted={isWishlisted} size="md" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
                  {dress.designer ? <span>{dress.designer}</span> : null}
                  <span className="rounded-full border border-charcoal/10 px-2 py-0.5 capitalize">
                    {dress.category}
                  </span>
                  {cityLabel ? (
                    <span className="rounded-full border border-charcoal/10 px-2 py-0.5">
                      {cityLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Price block */}
              <div className="rounded-2xl border border-charcoal/10 bg-cream p-5">
                <p className="font-display text-3xl font-semibold text-rose-gold">
                  {formatIDR(dress.daily_price_idr)}
                  <span className="ml-1 text-base font-normal text-charcoal/60">
                    {tDetail.perDay}
                  </span>
                </p>
                {dress.deposit_idr && dress.deposit_idr > 0 ? (
                  <p
                    className="mt-1 text-sm text-charcoal/70"
                    title={tDetail.depositTooltip}
                  >
                    {tDetail.depositLine}:{" "}
                    <span className="font-medium">{formatIDR(dress.deposit_idr)}</span>
                  </p>
                ) : null}
              </div>

              {/* Variant + dates + CTA */}
              <DressActions
                dressId={dress.id}
                variants={variants}
                unavailableByVariant={unavailableByVariant}
                dailyPriceIdr={dress.daily_price_idr}
                depositIdr={dress.deposit_idr ?? 0}
                minDays={dress.min_rental_days ?? 1}
                maxDays={dress.max_rental_days ?? 7}
                userSizing={userSizing}
                t={tDetail}
                measurementLabels={{
                  bustLabel: t.account.sizing.bustLabel,
                  waistLabel: t.account.sizing.waistLabel,
                  hipLabel: t.account.sizing.hipLabel,
                  shoulderLabel: t.account.sizing.shoulderLabel,
                  lengthLabel: t.account.sizing.lengthLabel,
                  cmShort: t.account.sizing.cmShort,
                }}
              />
            </div>
          </div>

          {/* Description + Partner sections */}
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="font-display text-2xl text-charcoal">
                {tDetail.tabs.description}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
                {dress.description ?? "—"}
              </p>
            </div>

            {/* Partner mini card */}
            {partner ? (
              <aside className="rounded-2xl border border-charcoal/10 bg-cream p-5">
                <p className="text-[10px] uppercase tracking-widest text-charcoal/50">
                  {tDetail.tabs.partner}
                </p>
                <h3 className="mt-1 font-display text-xl text-charcoal">
                  {partner.brand_name}
                </h3>
                {partner.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-charcoal/70">
                    {partner.description}
                  </p>
                ) : null}
                <Link
                  href={`/p/${partner.slug}`}
                  className="mt-4 inline-flex text-sm font-medium text-rose-gold hover:underline"
                >
                  {tDetail.seeAllFromPartner} →
                </Link>
              </aside>
            ) : null}
          </div>
        </div>
      </main>

      <SiteFooter locale={defaultLocale} />
    </div>
  );
}
