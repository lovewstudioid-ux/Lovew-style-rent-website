import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";

export const metadata = { title: "LOVEW Spaces — Studios & venues to book · LOVEW Studio" };

const LOCATIONS = ["All Indonesia", "Jabodetabek", "Surabaya"];
const TYPES = ["All", "Indoor", "Outdoor"];

const SPACES = [
  { name: "Atrium Loft", area: "Jakarta Selatan", type: "Indoor", price: "from Rp 350K / hr", wa: "6281234567890", photo: PHOTO.spaceStudio },
  { name: "The White Room", area: "Tangerang", type: "Indoor", price: "from Rp 280K / hr", wa: "6281234567890", photo: PHOTO.spaceRoom },
  { name: "Garden Pavilion", area: "Bogor", type: "Outdoor", price: "from Rp 500K / hr", wa: "6281234567890", photo: PHOTO.spaceWarm },
  { name: "Studio Nordlys", area: "Surabaya", type: "Indoor", price: "from Rp 300K / hr", wa: "6281234567890", photo: PHOTO.spaceLounge },
  { name: "Rooftop Terrace", area: "Jakarta Pusat", type: "Outdoor", price: "from Rp 650K / hr", wa: "6281234567890", photo: PHOTO.blazer },
  { name: "Concrete Gallery", area: "Bekasi", type: "Indoor", price: "from Rp 320K / hr", wa: "6281234567890", photo: PHOTO.spaceStudio },
];

export default function SpacesPage() {
  return (
    <>
      <section className="relative h-[64vh] min-h-[460px] w-full overflow-hidden border-b border-ink/10">
        <Image src={img(PHOTO.spaceStudio, 1800)} alt="LOVEW Spaces" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full">
          <div className="mx-auto max-w-editorial px-6 pb-12 text-white">
            <Label className="text-white/70">LOVEW Spaces</Label>
            <h1 className="mt-4 max-w-2xl font-display text-[2.6rem] font-normal leading-tight md:text-6xl">
              Studios &amp; venues, <span className="italic">ready when you are.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm font-light text-white/80">
              Hand-picked spaces across Indonesia — book availability directly with
              each studio on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-16 md:py-24">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-ink/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-ink/40">Location</span>
            <div className="flex gap-2">
              {LOCATIONS.map((l, i) => (
                <button key={l} type="button" className={`px-3 py-1.5 text-xs transition-colors ${i === 1 ? "bg-ink text-white" : "border border-ink/15 text-ink/70 hover:border-wine"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-ink/40">Type</span>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button key={t} type="button" className="border border-ink/15 px-3 py-1.5 text-xs text-ink/70 transition-colors hover:border-wine">{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {SPACES.map((s) => (
            <div key={s.name} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f2ef]">
                <Image src={img(s.photo, 800)} alt={s.name} fill sizes="(min-width:1024px) 30vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink">{s.type}</span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg text-ink">{s.name}</h3>
                  <span className="text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">{s.area}</span>
                </div>
                <p className="mt-1 text-sm text-ink/55">{s.price}</p>
                <a
                  href={`https://wa.me/${s.wa}?text=${encodeURIComponent("Hi! I'd like to check availability for " + s.name + " via LOVEW Spaces.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-wine hover:text-wine"
                >
                  Check availability on WhatsApp →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
