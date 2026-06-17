import Link from "next/link";
import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";
import { StyleIdExperience } from "@/components/style-id-experience";

export const metadata = { title: "Style ID — Discover your colours & fit · LOVEW Studio" };

const STEPS = [
  { n: "01", t: "Take a photo", b: "Upload a clear selfie in natural light. No app, no sign-up to start." },
  { n: "02", t: "Get your Style ID", b: "Your colour palette, season, and styling notes — hair, accessories, current trends." },
  { n: "03", t: "Save your Sizing Card", b: "Follow our simple measurement guide and save a Sizing Card you can reuse everywhere." },
];

const PALETTE = ["#4C0B19", "#8A5A4A", "#C9BDA6", "#EDE6D6", "#938A65", "#231A16"];

export default function DiscoverPage() {
  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>Style ID · free</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.2rem]">
              Discover your
              <br />
              <span className="italic text-wine">colours &amp; fit.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              A two-minute style read from a single photo — your palette, your
              season, and the pieces that will love you back. Save your sizing
              once and shop smarter everywhere.
            </p>
            <div className="mt-11">
              <Link href="#start" className="inline-flex items-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine">
                Start your Style ID →
              </Link>
            </div>
          </div>
          <div className="relative min-h-[60vh] md:min-h-[82vh]">
            <Image src={img(PHOTO.beauty2, 1200)} alt="Style analysis" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* The Style ID tool */}
      <section id="start" className="scroll-mt-24 border-b border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto max-w-editorial px-6 py-20 md:py-28">
          <StyleIdExperience />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-editorial px-6 py-24 md:py-32">
        <Label>How it works</Label>
        <h2 className="mt-4 max-w-xl font-display text-4xl font-normal text-ink md:text-5xl">Two minutes to your look.</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-ink/15 pt-6">
              <p className="font-display text-2xl text-ink/30">{s.n}</p>
              <h3 className="mt-4 text-sm uppercase tracking-[0.14em] text-ink">{s.t}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink/55">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample result card */}
      <section className="border-y border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto grid max-w-editorial items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <Label>A peek at your result</Label>
            <h2 className="mt-4 font-display text-3xl font-normal text-ink md:text-4xl">Your Style ID card.</h2>
            <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-ink/60">
              Beautiful, shareable, and yours — a card you can post, save, and bring
              to every fitting. It links straight into pieces to rent or shop.
            </p>
          </div>
          {/* mock card */}
          <div className="mx-auto w-full max-w-sm border border-ink/12 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <Label className="text-[0.6rem]">Style ID</Label>
              <span className="font-display text-sm text-wine">LOVEW</span>
            </div>
            <p className="mt-6 font-display text-2xl text-ink">Warm Autumn</p>
            <p className="mt-1 text-xs text-ink/50">Soft, earthy, with depth.</p>
            <div className="mt-5 flex gap-1.5">
              {PALETTE.map((c) => (
                <span key={c} className="h-9 flex-1 rounded-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <dl className="mt-6 space-y-2 text-xs text-ink/60">
              <div className="flex justify-between"><dt>Best necklines</dt><dd className="text-ink">Soft V · cowl</dd></div>
              <div className="flex justify-between"><dt>Metals</dt><dd className="text-ink">Gold · bronze</dd></div>
              <div className="flex justify-between"><dt>Saved size</dt><dd className="text-ink">M · 88/70/96</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
