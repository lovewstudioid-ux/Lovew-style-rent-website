import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { searchDresses, getWishlistIds } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DressCard } from "@/components/dress/dress-card";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { SortMenu } from "@/components/search/sort-menu";
import { MobileFilterDrawer } from "@/components/search/mobile-filter-drawer";

export const metadata = { title: "Jelajahi koleksi" };

const PAGE_SIZE = 24;

function toArray(value: string | string[] | undefined): string[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

function toNum(value: string | string[] | undefined): number | null {
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check whether the user has a default sizing profile (drives the "Fits my size" toggle).
  let hasSizingProfile = false;
  if (user) {
    const { count } = await supabase
      .from("sizing_profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_default", true);
    hasSizingProfile = (count ?? 0) > 0;
  }

  const fitsMySize = searchParams.fits_my_size === "1";
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const sort =
    (typeof searchParams.sort === "string" &&
      ["relevance", "price_asc", "price_desc", "newest", "rating"].includes(searchParams.sort) &&
      searchParams.sort) ||
    "relevance";

  const { rows, total } = await searchDresses({
    city: typeof searchParams.city === "string" ? searchParams.city : null,
    start: typeof searchParams.start === "string" ? searchParams.start : null,
    end: typeof searchParams.end === "string" ? searchParams.end : null,
    categories: toArray(searchParams.category),
    occasions: toArray(searchParams.occasion),
    colors: toArray(searchParams.color),
    size: typeof searchParams.size === "string" ? searchParams.size : null,
    minPrice: toNum(searchParams.min_price),
    maxPrice: toNum(searchParams.max_price),
    fitsUserId: fitsMySize && user ? user.id : null,
    sort: sort as "relevance" | "price_asc" | "price_desc" | "newest" | "rating",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const wishlistIds = await getWishlistIds(user?.id ?? null);

  const t = getDictionary(defaultLocale);
  const tb = t.catalog.browse;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />

      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-charcoal md:text-4xl">
              {tb.title}
            </h1>
          </header>

          <div className="grid gap-8 md:grid-cols-[280px_1fr]">
            {/* Desktop sidebar */}
            <aside className="hidden md:block">
              <FilterSidebar t={t.catalog.filters} hasSizingProfile={hasSizingProfile} />
            </aside>

            <section>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-charcoal/70">
                  <span className="font-medium text-charcoal">{total.toLocaleString("id-ID")}</span>{" "}
                  {tb.countLabel}
                </p>
                <div className="flex items-center gap-3">
                  <SortMenu t={tb} />
                  <MobileFilterDrawer t={t.catalog} hasSizingProfile={hasSizingProfile} />
                </div>
              </div>

              {rows.length === 0 ? (
                <div className="mt-12 rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
                  <p className="font-display text-2xl text-charcoal">{tb.empty}</p>
                  <p className="mt-2 text-sm text-charcoal/60">{tb.emptyHint}</p>
                  <Link
                    href="/browse"
                    className="mt-6 inline-flex text-sm font-medium text-rose-gold hover:underline"
                  >
                    ← {tb.reset}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {rows.map((row) => (
                      <DressCard
                        key={row.id}
                        dress={{
                          id: row.id,
                          slug: row.slug,
                          title: row.title,
                          cover_image_url: row.cover_image_url,
                          daily_price_idr: row.daily_price_idr,
                          partner_slug: row.partner_slug,
                          partner_brand: row.partner_brand,
                          partner_city: row.partner_city,
                          rating_avg: row.rating_avg,
                          rating_count: row.rating_count,
                        }}
                        isWishlisted={wishlistIds.has(row.id)}
                      />
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      buildHref={(p) => buildPageHref(searchParams, p)}
                    />
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter locale={defaultLocale} />
    </div>
  );
}

function buildPageHref(
  searchParams: { [k: string]: string | string[] | undefined },
  page: number,
): string {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
    else if (value) next.set(key, value);
  }
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/browse?${qs}` : "/browse";
}

function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const prev = currentPage > 1 ? buildHref(currentPage - 1) : null;
  const next = currentPage < totalPages ? buildHref(currentPage + 1) : null;
  return (
    <nav className="mt-12 flex items-center justify-between text-sm">
      {prev ? (
        <Link href={prev} className="text-rose-gold hover:underline">
          ← Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <span className="text-charcoal/60">
        Halaman {currentPage} / {totalPages}
      </span>
      {next ? (
        <Link href={next} className="text-rose-gold hover:underline">
          Selanjutnya →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
