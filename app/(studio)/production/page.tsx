import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label, ContactForm } from "@/components/studio-ui";

export const metadata = { title: "LOVEW Production — Photo & video · LOVEW Studio" };

const WORK = [
  { photo: PHOTO.shoot2, video: false, span: true },
  { photo: PHOTO.shoot1, video: true },
  { photo: PHOTO.maroonGown, video: false },
  { photo: PHOTO.shoot3, video: true },
  { photo: PHOTO.blazer, video: false },
];
const SERVICES = [
  { name: "Photography", b: "Editorial, lookbook, product, and event coverage." },
  { name: "Videography", b: "Brand films, reels, and behind-the-scenes." },
  { name: "Full production", b: "Concept, casting, styling, location, and post." },
];

export default function ProductionPage() {
  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>LOVEW Production</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.2rem]">
              Pictures that <span className="italic text-wine">last.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              Photo &amp; video for brands, weddings, and editorials — concept to
              final cut, with a studio that handles every detail.
            </p>
            <div className="mt-11">
              <a href="#enquire" className="inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-xs uppercase tracking-[0.26em] text-ink transition-colors hover:border-wine hover:text-wine">Start a project →</a>
            </div>
          </div>
          <div className="relative min-h-[58vh] md:min-h-[80vh]">
            <Image src={img(PHOTO.shoot2, 1200)} alt="LOVEW Production" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-editorial px-6 py-24 md:py-28">
        <Label>Recent work</Label>
        <h2 className="mt-4 font-display text-4xl font-normal text-ink md:text-5xl">Photo &amp; film.</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {WORK.map((w, i) => (
            <div key={i} className={`group relative overflow-hidden bg-[#f4f2ef] ${w.span ? "row-span-2 aspect-[3/4] md:aspect-auto" : "aspect-square"}`}>
              <Image src={img(w.photo, 800)} alt="Production work" fill sizes="(min-width:768px) 33vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              {w.video && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 text-white backdrop-blur-sm">▶</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto max-w-editorial px-6 py-20 md:py-24">
          <Label>What we offer</Label>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.name} className="border-t border-ink/15 pt-6">
                <h3 className="font-display text-xl text-ink">{s.name}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink/60">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="mx-auto max-w-3xl px-6 py-24 md:py-28">
        <Label>Start a project</Label>
        <h2 className="mt-4 font-display text-3xl font-normal text-ink md:text-4xl">Let's make something.</h2>
        <div className="mt-10"><ContactForm subject="shoot" /></div>
      </section>
    </>
  );
}
