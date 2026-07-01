import Link from "next/link";
import Image from "next/image";
import { SERVICES, PHOTO, img } from "@/lib/studio";
import { Label, StudioFooter } from "@/components/studio-ui";
import { StudioHeaderServer } from "@/components/studio-header-server";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudioHeaderServer />

      <main className="flex-1">
        {/* Short intro — wine band, no image */}
        <section className="bg-wine text-chiffon">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">
              The Creative House
            </p>
            <p className="mx-auto mt-7 max-w-xl text-base font-light leading-relaxed text-chiffon/80 md:text-lg">
              LOVEW Studio is one home for the things that make an occasion —
              wardrobe to rent and shop, studios and venues to book, personal
              styling, photo &amp; video, and the digital products that bring
              everyone in.
            </p>
          </div>
        </section>

        {/* Free styling-analysis highlight — placed right after the intro */}
        <section className="border-b border-ink/10 bg-[#faf8f5]">
          <div className="mx-auto grid max-w-editorial items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-20">
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-[5/6]">
              <Image src={img(PHOTO.beauty1, 1000)} alt="Style ID — free style analysis" fill sizes="(min-width:768px) 45vw, 90vw" className="object-cover" />
            </div>
            <div>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-wine">Style ID</p>
              <h2 className="mt-5 font-display text-[2.4rem] font-normal leading-[1.08] text-ink md:text-[3rem]">
                Discover your colours &amp; fit — <span className="italic text-wine">free.</span>
              </h2>
              <p className="mt-6 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/60">
                Upload one photo and get a personalised style read in two minutes —
                your palette, your season, hair and accessory notes, and the pieces
                that love you back. Save your sizing once and shop smarter across
                LOVEW.
              </p>
              <div className="mt-9">
                <Link href="/discover" className="inline-flex items-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine">
                  Start your Style ID →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services grid — this is the main navigation */}
        <section className="mx-auto max-w-editorial px-6 py-24 md:py-32">
          <div className="max-w-xl">
            <Label>What we do</Label>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Link key={s.key} href={s.href} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f2ef]">
                  <Image src={img(s.photo, 900)} alt={s.name} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  <span className="absolute left-4 top-4 text-[0.65rem] font-medium text-white/80">0{i + 1}</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-xl text-ink">{s.name}</h3>
                    <p className="mt-1 text-[0.8rem] text-ink/50">{s.tagline}</p>
                  </div>
                  <span className="text-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-wine">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Free tools — the new consumer apps */}
        <section className="border-t border-ink/10 bg-[#faf8f5]">
          <div className="mx-auto max-w-editorial px-6 py-20 md:py-24">
            <Label>Free tools</Label>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-normal text-ink md:text-4xl">Make it yours — free to use.</h2>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Style ID", tagline: "Your colours, fit & body type from one selfie", href: "/discover" },
                { name: "Wardrobe", tagline: "Build a gallery of your closet", href: "/wardrobe" },
                { name: "Gift Registry", tagline: "A wishlist to share for any occasion", href: "/registry" },
                { name: "Event Seating", tagline: "Digital seating chart with QR finder", href: "/event" },
              ].map((t) => (
                <Link key={t.name} href={t.href} className="group border border-ink/12 bg-white p-6 transition-colors hover:border-wine">
                  <h3 className="font-display text-xl text-ink">{t.name}</h3>
                  <p className="mt-2 text-[0.82rem] font-light leading-relaxed text-ink/55">{t.tagline}</p>
                  <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-ink/40 group-hover:text-wine">Open →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StudioFooter />
    </div>
  );
}
