import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, MapPin, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPartnerBySlug, getWishlistIds } from "@/lib/catalog";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DressCard } from "@/components/dress/dress-card";

interface PageProps {
  params: { partner_slug: string };
}

export async function generateMetadata({ params }: PageProps) {
  const res = await getPartnerBySlug(params.partner_slug);
  if (!res) return { title: "Partner tidak ditemukan" };
  return { title: res.partner.brand_name };
}

export default async function PartnerStorefrontPage({ params }: PageProps) {
  const res = await getPartnerBySlug(params.partner_slug);
  if (!res) notFound();
  const { partner, dresses } = res;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const wishlistIds = await getWishlistIds(user?.id ?? null);

  const t = getDictionary(defaultLocale);
  const cityLabel = partner.city
    ? partner.city.charAt(0).toUpperCase() + partner.city.slice(1)
    : "";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />

      <main className="flex-1 bg-cream">
        {/* Cover banner */}
        <div className="relative h-48 w-full overflow-hidden bg-soft-blush md:h-64">
          {partner.cover_url ? (
            <Image
              src={partner.cover_url}
              alt={partner.brand_name}
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent" />
        </div>

        <div className="mx-auto -mt-16 max-w-6xl px-6">
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-charcoal/10 bg-cream p-6 md:flex-row md:items-end md:p-8">
            {/* Logo */}
            <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-cream bg-soft-blush shadow-md">
              {partner.logo_url ? (
                <Image
                  src={partner.logo_url}
                  alt={partner.brand_name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl text-rose-gold">
                  {partner.brand_name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-3xl font-semibold text-charcoal md:text-4xl">
                {partner.brand_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-charcoal/60">
                {cityLabel ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {cityLabel}
                  </span>
                ) : null}
                {partner.shipping_available ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-sage">
                    <Truck className="h-3 w-3" /> Bisa kirim
                  </span>
                ) : null}
                {partner.rating_avg && partner.rating_count ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-rose-gold text-rose-gold" />
                    {Number(partner.rating_avg).toFixed(1)}{" "}
                    <span className="text-charcoal/40">({partner.rating_count})</span>
                  </span>
                ) : null}
              </div>
              {partner.description ? (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/80">
                  {partner.description}
                </p>
              ) : null}
              <div className="mt-3 flex gap-3 text-xs text-charcoal/60">
                {partner.instagram ? (
                  <a
                    href={partner.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-rose-gold"
                  >
                    Instagram
                  </a>
                ) : null}
                {partner.tiktok ? (
                  <a
                    href={partner.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-rose-gold"
                  >
                    TikTok
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Catalog */}
          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-charcoal">
              Koleksi
            </h2>
            {dresses.length === 0 ? (
              <p className="mt-4 text-sm text-charcoal/60">
                Partner ini belum punya dress yang aktif.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {dresses.map((d) => (
                  <DressCard
                    key={d.id}
                    dress={{
                      id: d.id,
                      slug: d.slug,
                      title: d.title,
                      cover_image_url: d.cover_image_url,
                      daily_price_idr: d.daily_price_idr,
                      partner_slug: partner.slug,
                      partner_brand: partner.brand_name,
                      partner_city: partner.city,
                      rating_avg: d.rating_avg,
                      rating_count: d.rating_count,
                    }}
                    isWishlisted={wishlistIds.has(d.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter locale={defaultLocale} />
    </div>
  );
}
