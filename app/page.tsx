import Link from "next/link";
import Image from "next/image";
import { getDictionary, type Locale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const locale: Locale = "en";

/* Editorial placeholder photography (Unsplash) — swap for brand shoots before
   launch. Muted/neutral tones to suit the white, minimalist canvas. */
const HERO_IMG =
  "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=1400&q=85&auto=format&fit=crop";
const EDITORIAL_IMG =
  "https://images.unsplash.com/photo-1629922947773-ad0eff4ad420?w=1800&q=85&auto=format&fit=crop";

const collection = [
  {
    name: "Aurora Gown",
    city: "Jakarta",
    price: "Rp 450K",
    img: "https://images.unsplash.com/photo-1613424935149-c8efd5c41e91?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Selene Gown",
    city: "Bali",
    price: "Rp 520K",
    img: "https://images.unsplash.com/photo-1547697933-66bcb20f114a?w=900&q=85&auto=format&fit=crop",
  },
  {
    name: "Noir Column",
    city: "Surabaya",
    price: "Rp 480K",
    img: "https://images.unsplash.com/photo-1763336016192-c7b62602e993?w=900&q=85&auto=format&fit=crop",
  },
];

export default function HomePage() {
  const t = getDictionary(locale);
  const h = t.home;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader locale={locale} />

      <main className="flex-1">
        {/* ───────────────────────── Hero ───────────────────────── */}
        <section className="border-b border-ink/10">
          <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
            {/* Copy, set in a generous field of space */}
            <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16 lg:pr-24">
              <p className="text-[0.7rem] uppercase tracking-[0.34em] text-ink/45">
                LOVEW Style — Designer Dress Rental
              </p>
              <h1 className="mt-8 font-display text-[3.25rem] font-normal leading-[1.02] tracking-[-0.01em] text-ink md:text-7xl">
                {h.hero.titleLead}
                <br />
                <span className="italic text-wine">{h.hero.titleEm}</span>
              </h1>
              <p className="mt-8 max-w-sm text-[0.95rem] font-light leading-relaxed text-ink/55">
                A quietly curated wardrobe of designer pieces — borrowed for the
                occasions that deserve them, returned with nothing kept but the
                memory.
              </p>
              <div className="mt-12">
                <Link
                  href="/browse"
                  className="group inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-xs uppercase tracking-[0.28em] text-ink transition-colors hover:border-wine hover:text-wine"
                >
                  Explore the collection
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* A single editorial image carries the luxury */}
            <div className="relative min-h-[62vh] md:min-h-[86vh]">
              <Image
                src={HERO_IMG}
                alt="Model in a deep wine evening gown"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ───────────────────── The collection ─────────────────── */}
        <section className="mx-auto max-w-editorial px-6 py-24 md:py-32">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/45">
                {h.featured.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl font-normal text-ink md:text-5xl">
                The Collection
              </h2>
            </div>
            <Link
              href="/browse"
              className="hidden shrink-0 border-b border-ink/25 pb-1.5 text-xs uppercase tracking-[0.24em] text-ink transition-colors hover:border-wine hover:text-wine sm:inline-block"
            >
              View all
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 md:gap-x-8">
            {collection.map((item) => (
              <Link key={item.name} href="/browse" className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ef]">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 30vw, 45vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.16em] text-ink/40">
                      {item.city}
                    </p>
                  </div>
                  <p className="text-sm text-ink/70">
                    {item.price}
                    <span className="text-ink/40"> / day</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 sm:hidden">
            <Link
              href="/browse"
              className="border-b border-ink/25 pb-1.5 text-xs uppercase tracking-[0.24em] text-ink"
            >
              View all →
            </Link>
          </div>
        </section>

        {/* ──────────────────── Full-bleed editorial ─────────────── */}
        <section className="relative h-[72vh] min-h-[440px] w-full overflow-hidden">
          <Image
            src={EDITORIAL_IMG}
            alt="Editorial fashion portrait"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </section>

        {/* ───────────────────── How it works ───────────────────── */}
        <section className="mx-auto max-w-editorial px-6 py-24 md:py-32">
          <div className="max-w-xl">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-ink/45">
              {h.steps.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl font-normal leading-tight text-ink md:text-5xl">
              {h.steps.title}
            </h2>
          </div>

          <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {h.steps.items.map((step) => (
              <div key={step.n} className="border-t border-ink/15 pt-6">
                <p className="font-display text-2xl font-normal text-ink/30">
                  {step.n}
                </p>
                <h3 className="mt-4 text-sm uppercase tracking-[0.12em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink/55">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────── Closing statement ────────────────── */}
        <section className="border-t border-ink/10 px-6 py-28 text-center md:py-36">
          <p className="text-[0.7rem] uppercase tracking-[0.34em] text-ink/45">
            {brand.product}
          </p>
          <h2 className="mx-auto mt-8 max-w-2xl font-display text-4xl font-normal italic leading-tight text-ink md:text-6xl">
            {brand.taglines.style}
          </h2>
          <div className="mt-12">
            <Link
              href="/browse"
              className="group inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-xs uppercase tracking-[0.28em] text-ink transition-colors hover:border-wine hover:text-wine"
            >
              {h.closing.cta}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
