import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { WishlistButton } from "@/components/dress/wishlist-button";

export interface DressCardData {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  daily_price_idr: number;
  partner_slug: string;
  partner_brand: string;
  partner_city: string;
  rating_avg: number | null;
  rating_count: number | null;
}

interface DressCardProps {
  dress: DressCardData;
  isWishlisted?: boolean;
}

/**
 * Single dress card used in search results, partner storefronts, and the
 * homepage's featured strip. Hover lifts the image; the whole card links to
 * the detail page (the heart's form stops propagation so it isn't followed).
 */
export function DressCard({ dress, isWishlisted = false }: DressCardProps) {
  const cityLabel = dress.partner_city
    ? dress.partner_city.charAt(0).toUpperCase() + dress.partner_city.slice(1)
    : "";

  return (
    <Link
      href={`/d/${dress.partner_slug}/${dress.slug}`}
      className="group block"
    >
      <article className="overflow-hidden rounded-2xl border border-charcoal/10 bg-cream transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/5] overflow-hidden bg-soft-blush">
          {dress.cover_image_url ? (
            <Image
              src={dress.cover_image_url}
              alt={dress.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-charcoal/40">
              No image
            </div>
          )}
          <div className="absolute right-2 top-2">
            <WishlistButton dressId={dress.id} isWishlisted={isWishlisted} />
          </div>
        </div>

        <div className="space-y-1.5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-sage">
            {dress.partner_brand}
          </p>
          <h3 className="line-clamp-2 font-display text-lg font-medium leading-snug text-charcoal">
            {dress.title}
          </h3>
          <p className="text-sm text-charcoal">
            <span className="font-medium">{formatIDR(dress.daily_price_idr)}</span>
            <span className="text-charcoal/60"> / hari</span>
          </p>
          <div className="flex items-center justify-between pt-1 text-xs text-charcoal/60">
            <span className="rounded-full border border-charcoal/10 px-2 py-0.5">
              {cityLabel}
            </span>
            {dress.rating_avg && dress.rating_count ? (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-rose-gold text-rose-gold" />
                {Number(dress.rating_avg).toFixed(1)}{" "}
                <span className="text-charcoal/40">({dress.rating_count})</span>
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
