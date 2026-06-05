import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label, ContactForm } from "@/components/studio-ui";

export const metadata = { title: "LOVEW Styling — Personal styling · LOVEW Studio" };

const PORTFOLIO = [PHOTO.rack, PHOTO.maroonGown, PHOTO.boutique, PHOTO.grayGown, PHOTO.coatRack, PHOTO.sofaDress];
const PACKAGES = [
  { name: "Event Styling", price: "from Rp 1.5M", b: "One occasion, head to toe — pulls, fittings, and a final look." },
  { name: "Wardrobe Edit", price: "from Rp 3M", b: "A half-day with your closet: edit, restyle, and a shopping list." },
  { name: "Editorial / Brand", price: "on request", b: "Styling for campaigns, lookbooks, and productions." },
];

export default function StylingPage() {
  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>LOVEW Styling</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.2rem]">
              Dressed with <span className="italic text-wine">intention.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              Personal and editorial styling for the moments that matter — from a
              single event to a full wardrobe edit. Considered, warm, and entirely
              yours.
            </p>
            <div className="mt-11">
              <a href="#enquire" className="inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-xs uppercase tracking-[0.26em] text-ink transition-colors hover:border-wine hover:text-wine">Book a session →</a>
            </div>
          </div>
          <div className="relative min-h-[58vh] md:min-h-[80vh]">
            <Image src={img(PHOTO.rack, 1200)} alt="LOVEW Styling" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-editorial px-6 py-24 md:py-28">
        <Label>Selected work</Label>
        <h2 className="mt-4 font-display text-4xl font-normal text-ink md:text-5xl">The portfolio.</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {PORTFOLIO.map((p, i) => (
            <div key={i} className={`relative overflow-hidden bg-[#f4f2ef] ${i % 5 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image src={img(p, 700)} alt="Styling work" fill sizes="(min-width:768px) 30vw, 45vw" className="object-cover transition-transform duration-700 hover:scale-[1.03]" />
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="border-y border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto max-w-editorial px-6 py-20 md:py-24">
          <Label>Packages</Label>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {PACKAGES.map((p) => (
              <div key={p.name} className="border-t border-ink/15 pt-6">
                <h3 className="font-display text-xl text-ink">{p.name}</h3>
                <p className="mt-1 text-sm text-wine">{p.price}</p>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink/60">{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="mx-auto max-w-3xl px-6 py-24 md:py-28">
        <Label>Enquire</Label>
        <h2 className="mt-4 font-display text-3xl font-normal text-ink md:text-4xl">Tell us about the occasion.</h2>
        <p className="mt-4 max-w-md text-sm font-light text-ink/55">We reply within a day to talk dates, looks, and budget.</p>
        <div className="mt-10"><ContactForm subject="styling session" /></div>
      </section>
    </>
  );
}
