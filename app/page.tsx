import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Ruler,
  ShieldCheck,
  Sparkles,
  CalendarHeart,
  Heart,
  Camera,
  Cake,
  Gem,
  Crown,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WordmarkStacked, Monogram } from "@/components/wordmark";

const locale: Locale = "en";

/* Editorial "photography" stand-ins — the brand moodboard rendered in CSS:
   Low-light interior, Stone & shadow, Wine saturation, Pearl & powder. */
const tiles = {
  wine: "bg-[radial-gradient(130%_130%_at_28%_18%,#6b1d2b_0%,#4c0b19_46%,#3a0812_100%)]",
  olive: "bg-[radial-gradient(130%_130%_at_28%_18%,#9c9272_0%,#4d3b2e_64%,#241a14_100%)]",
  pearl: "bg-[radial-gradient(130%_130%_at_30%_22%,#fbf9f1_0%,#e5ddcf_52%,#c9bda6_100%)]",
  plum: "bg-[radial-gradient(130%_130%_at_30%_20%,#8a3242_0%,#6b1d2b_55%,#3a0812_100%)]",
  stone: "bg-[radial-gradient(130%_130%_at_30%_20%,#cabfa9_0%,#8a7e63_60%,#4d3b2e_100%)]",
  cocoa: "bg-[radial-gradient(130%_130%_at_28%_18%,#7a4a3a_0%,#4d3b2e_58%,#241a14_100%)]",
};

const occasionMeta = [
  { key: "wedding", icon: CalendarHeart, tile: tiles.wine },
  { key: "engagement", icon: Heart, tile: tiles.plum },
  { key: "prom", icon: Gem, tile: tiles.olive },
  { key: "photoshoot", icon: Camera, tile: tiles.stone },
  { key: "traditional", icon: Crown, tile: tiles.wine },
  { key: "birthday", icon: Cake, tile: tiles.cocoa },
] as const;

const whyIcons = [Sparkles, ShieldCheck, Ruler];

export default function HomePage() {
  const t = getDictionary(locale);
  const h = t.home;
  const occasions = t.catalog.filters.occasions;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Announcement bar */}
      <div className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-2 text-center text-[0.72rem] font-medium uppercase tracking-[0.2em]">
          {h.announce}
        </div>
      </div>

      <SiteHeader locale={locale} />

      <main className="flex-1">
        {/* ───────────────────────── Hero ───────────────────────── */}
        <section className="relative overflow-hidden border-b border-ink/10">
          <div className="mx-auto grid max-w-editorial items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
            <div>
              <p className="eyebrow">{h.hero.eyebrow}</p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.02em] text-ink md:text-7xl">
                {h.hero.titleLead}
                <br />
                <span className="italic text-wine">{h.hero.titleEm}</span>
              </h1>
              <p className="mt-7 max-w-md text-base leading-relaxed text-ink/70">
                {h.hero.subtitle}
              </p>

              {/* Search entry */}
              <form
                action="/browse"
                className="mt-9 flex max-w-md flex-col gap-2 rounded-lg border border-ink/15 bg-chiffon p-2 shadow-sm sm:flex-row sm:items-center"
              >
                <label className="flex flex-1 flex-col px-3 py-1.5">
                  <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-ink/50">
                    {h.hero.searchCity}
                  </span>
                  <select
                    name="city"
                    className="bg-transparent text-sm text-ink outline-none"
                    defaultValue=""
                  >
                    <option value="">{h.hero.searchAny}</option>
                    {brand.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="hidden h-9 w-px bg-ink/10 sm:block" />
                <label className="flex flex-1 flex-col px-3 py-1.5">
                  <span className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-ink/50">
                    {h.hero.searchOccasion}
                  </span>
                  <select
                    name="occasion"
                    className="bg-transparent text-sm text-ink outline-none"
                    defaultValue=""
                  >
                    <option value="">{h.hero.searchAny}</option>
                    {occasionMeta.map((o) => (
                      <option key={o.key} value={o.key}>
                        {occasions[o.key as keyof typeof occasions]}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" size="default" className="sm:h-[3.25rem]">
                  {h.hero.searchCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-5 text-sm">
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-1.5 font-medium text-wine hover:underline"
                >
                  {h.hero.ctaSecondary}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Editorial collage */}
            <div className="relative hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <div className={`aspect-[3/4] rounded-lg ${tiles.wine}`} />
                <div className={`mt-10 aspect-[3/4] rounded-lg ${tiles.olive}`} />
                <div className={`-mt-6 aspect-[4/5] rounded-lg ${tiles.stone}`} />
                <div className={`aspect-[4/5] rounded-lg ${tiles.plum}`} />
              </div>
              {/* Seal */}
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-chiffon text-wine shadow-lg">
                <Monogram size={84} className="border-2" />
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── Stats ───────────────────────── */}
        <section className="border-b border-ink/10 bg-pearl">
          <div className="mx-auto grid max-w-editorial grid-cols-2 gap-px px-6 md:grid-cols-4">
            {h.stats.map((s) => (
              <div key={s.label} className="px-2 py-8 text-center">
                <p className="font-display text-4xl font-semibold text-wine">
                  {s.value}
                </p>
                <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink/55">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────── Shop by occasion ─────────────────── */}
        <section className="mx-auto max-w-editorial px-6 py-20">
          <SectionHead
            eyebrow={h.occasions.eyebrow}
            title={h.occasions.title}
            subtitle={h.occasions.subtitle}
          />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {occasionMeta.map(({ key, icon: Icon, tile }) => (
              <Link
                key={key}
                href={`/browse?occasion=${key}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <div className={`absolute inset-0 ${tile} transition-transform duration-500 group-hover:scale-105`} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-between p-5 text-chiffon">
                  <Icon className="h-5 w-5 opacity-90" />
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-medium">
                      {occasions[key as keyof typeof occasions]}
                    </span>
                    <ArrowUpRight className="h-5 w-5 translate-y-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ───────────────────── Featured looks ─────────────────── */}
        <section className="border-y border-ink/10 bg-bone/60">
          <div className="mx-auto max-w-editorial px-6 py-20">
            <div className="flex items-end justify-between gap-6">
              <SectionHead
                eyebrow={h.featured.eyebrow}
                title={h.featured.title}
                subtitle={h.featured.subtitle}
              />
              <Link
                href="/browse"
                className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-wine hover:underline md:inline-flex"
              >
                {h.featured.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
              {h.featured.items.map((item, i) => {
                const tileList = [tiles.wine, tiles.olive, tiles.plum, tiles.stone];
                return (
                  <Link key={item.name} href="/browse" className="group">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                      <div className={`absolute inset-0 ${tileList[i % tileList.length]} transition-transform duration-500 group-hover:scale-105`} />
                      <span className="absolute left-3 top-3 rounded-full bg-chiffon/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink">
                        {item.city}
                      </span>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-tight text-ink">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-ink/55">{item.tag}</p>
                      </div>
                      <p className="shrink-0 text-right text-sm font-medium text-wine">
                        {item.price}
                        <span className="block text-[0.65rem] font-normal text-ink/45">
                          {h.featured.perDay}
                        </span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Button asChild variant="outline">
                <Link href="/browse">
                  {h.featured.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ───────────────────── How it works ───────────────────── */}
        <section className="mx-auto max-w-editorial px-6 py-20">
          <SectionHead eyebrow={h.steps.eyebrow} title={h.steps.title} />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {h.steps.items.map((step) => (
              <div key={step.n} className="border-t border-wine/30 pt-5">
                <p className="font-display text-3xl font-semibold text-wine/30">
                  {step.n}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────── Why LOVEW Style ─────────────────── */}
        <section className="border-y border-ink/10 bg-pearl">
          <div className="mx-auto max-w-editorial px-6 py-20">
            <SectionHead eyebrow={h.why.eyebrow} title={h.why.title} />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {t.valueProps.items.map((item, i) => {
                const Icon = whyIcons[i] ?? Sparkles;
                return (
                  <div
                    key={item.title}
                    className="rounded-lg border border-ink/10 bg-chiffon p-7"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-wine/10 text-wine">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────────────── Partner CTA ────────────────────── */}
        <section className="mx-auto max-w-editorial px-6 py-20">
          <div className="relative overflow-hidden rounded-xl border border-ink/10">
            <div className={`absolute inset-0 ${tiles.olive} opacity-95`} />
            <div className="relative grid gap-8 p-10 md:grid-cols-[1.3fr_1fr] md:items-center md:p-14">
              <div className="text-chiffon">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-chiffon/70">
                  {h.partner.eyebrow}
                </p>
                <h2 className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight md:text-4xl">
                  {h.partner.title}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-chiffon/80">
                  {h.partner.body}
                </p>
              </div>
              <div className="md:text-right">
                <Button
                  asChild
                  size="lg"
                  className="bg-chiffon text-wine hover:bg-chiffon/90"
                >
                  <Link href="/partners">
                    {h.partner.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────── Closing brand moment ────────────── */}
        <section className={`relative ${tiles.wine}`}>
          <div className="mx-auto max-w-editorial px-6 py-24 text-center text-chiffon">
            <WordmarkStacked className="mx-auto text-chiffon" />
            <h2 className="mx-auto mt-10 max-w-2xl font-display text-4xl font-medium italic leading-tight md:text-5xl">
              {brand.taglines.style}
            </h2>
            <div className="mt-9">
              <Button
                asChild
                size="lg"
                className="bg-chiffon text-wine hover:bg-chiffon/90"
              >
                <Link href="/browse">
                  {h.closing.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-base text-ink/65">{subtitle}</p>
      ) : null}
    </div>
  );
}
