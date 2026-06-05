import Link from "next/link";
import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";

export const metadata = { title: "LOVEW Digitals — Wedding invitations · LOVEW Studio" };

const TEMPLATES = [
  { name: "Maison", style: "Classic serif", price: "Rp 250K", photo: PHOTO.inviteCard },
  { name: "Bloom", style: "Floral watercolour", price: "Rp 280K", photo: PHOTO.invitePaper },
  { name: "Ribbon", style: "Romantic, ribboned", price: "Rp 300K", photo: PHOTO.inviteSuite },
  { name: "Minim", style: "Modern minimal", price: "Rp 240K", photo: PHOTO.inviteFlat },
];
const STEPS = [
  { n: "01", t: "Choose a template", b: "Pick a design and preview it live." },
  { n: "02", t: "Send your details", b: "Names, date, venue, RSVP, gallery — we personalise it." },
  { n: "03", t: "Share your link", b: "Get a beautiful digital invitation link in 1–2 days." },
];

export default function InvitationsPage() {
  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>LOVEW Digitals</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.2rem]">
              Invitations, <span className="italic text-wine">beautifully digital.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              Elegant wedding invitation templates — choose a design, send your
              details, and share a personalised link your guests will love.
            </p>
            <div className="mt-11">
              <a href="#templates" className="inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-xs uppercase tracking-[0.26em] text-ink transition-colors hover:border-wine hover:text-wine">Browse templates →</a>
            </div>
          </div>
          <div className="relative min-h-[56vh] md:min-h-[80vh]">
            <Image src={img(PHOTO.inviteSuite, 1200)} alt="LOVEW Digitals" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Template store */}
      <section id="templates" className="mx-auto max-w-editorial px-6 py-24 md:py-28">
        <div className="flex items-end justify-between">
          <div>
            <Label>The store</Label>
            <h2 className="mt-4 font-display text-4xl font-normal text-ink md:text-5xl">Templates.</h2>
          </div>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-ink/40 sm:block">Personalised · delivered in 1–2 days</span>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {TEMPLATES.map((t) => (
            <Link key={t.name} href="#" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ef]">
                <Image src={img(t.photo, 700)} alt={t.name} fill sizes="(min-width:768px) 22vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-ink/40 to-transparent py-6 text-[0.7rem] uppercase tracking-[0.2em] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Live preview →
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base text-ink">{t.name}</h3>
                  <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">{t.style}</p>
                </div>
                <p className="text-sm text-ink/70">{t.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto max-w-editorial px-6 py-20 md:py-24">
          <Label>How it works</Label>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border-t border-ink/15 pt-6">
                <p className="font-display text-2xl text-ink/30">{s.n}</p>
                <h3 className="mt-4 text-sm uppercase tracking-[0.14em] text-ink">{s.t}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink/55">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
