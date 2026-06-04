import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { DressCard } from "@/components/dress/dress-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/wishlist");

  // Join wishlists → dresses → partners.
  const { data } = await supabase
    .from("wishlists")
    .select(
      `
      created_at,
      dresses (
        id, slug, title, cover_image_url, daily_price_idr, rating_avg, rating_count,
        partners ( slug, brand_name, city, status )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? [])
    .map((r) => {
      const d = Array.isArray(r.dresses) ? r.dresses[0] : r.dresses;
      if (!d) return null;
      const p = Array.isArray(d.partners) ? d.partners[0] : d.partners;
      if (!p || p.status !== "active") return null;
      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        cover_image_url: d.cover_image_url,
        daily_price_idr: d.daily_price_idr,
        rating_avg: d.rating_avg,
        rating_count: d.rating_count,
        partner_slug: p.slug,
        partner_brand: p.brand_name,
        partner_city: p.city,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const t = getDictionary(defaultLocale).catalog.wishlist;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          {t.title}
        </h1>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
          <p className="font-display text-2xl text-charcoal">{t.empty}</p>
          <Button asChild className="mt-6">
            <Link href="/browse">{t.cta}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <DressCard key={row.id} dress={row} isWishlisted />
          ))}
        </div>
      )}
    </div>
  );
}
