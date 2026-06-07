import Link from "next/link";
import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";

export const metadata = { title: "LOVEW Fashion — Rent & shop the look · LOVEW Studio" };

const FILTERS = [
  { name: "Category", value: "All" },
  { name: "Occasion", value: "Wedding · Graduation · Party" },
  { name: "Location", value: "Jakarta" },
  { name: "Colour", value: "Any" },
  { name: "Size", value: "Fits me" },
  { name: "Price", value: "Any" },
];

const ITEMS = [
  { name: "Aurora Champagne Gown", meta: "Gown · Jakarta", price: "Rp 450K / day", tag: "Rent", photo: PHOTO.maroonGown },
  { name: "Ivory Slip Dress", meta: "Dress · shop", price: "Rp 1.2M", tag: "Shop", photo: PHOTO.whiteDress },
  { name: "Selene Kebaya Set", meta: "Kebaya · Bali", price: "Rp 380K / day", tag: "Rent", photo: PHOTO.grayGown },
  { name: "Marble Two-Piece", meta: "Suit · shop", price: "Rp 890K", tag: "Shop", photo: PHOTO.sofaDress },
  { name: "Noir Column Gown", meta: "Gown · Surabaya", price: "Rp 520K / day", tag: "Rent", photo: PHOTO.blazer },
  { name: "Pearl Evening Set", meta: "Set · shop", price: "Rp 1.5M", tag: "Shop", photo: PHOTO.coatRack },
];

export default function StylePage() {
  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>LOVEW Fashion</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.4rem]">
              Rent the look.
              <br />
              <span className="italic text-wine">Or make it yours.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              One curated edit — pieces to <em>rent</em> from independent providers
              across Indonesia, and pieces to <em>shop</em>. Filter by occasion,
              colour, size, and city.
            </p>
          </div>
          <div className="relative min-h-[58vh] md:min-h-[82vh]">
            <Image src={img(PHOTO.maroonGown, 1400)} alt="LOVEW Fashion" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Filter bar (visual mock) + grid */}
      <section className="mx-auto max-w-editorial px-6 py-16 md:py-24">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3 border-b border-ink/10 pb-6">
          {FILTERS.map((f) => (
            <button key={f.name} type="button" className="group flex items-center gap-2 border border-ink/15 px-4 py-2 text-xs text-ink/70 transition-colors hover:border-wine">
              <span className="uppercase tracking-[0.14em] text-ink/40">{f.name}</span>
              <span className="text-ink">{f.value}</span>
              <span className="text-ink/30 group-hover:text-wine">▾</span>
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
          {ITEMS.map((it) => (
            <Link key={it.name} href="#" className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ef]">
                <Image src={img(it.photo, 800)} alt={it.name} fill sizes="(min-width:768px) 30vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className={`absolute left-3 top-3 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] ${it.tag === "Rent" ? "bg-wine text-white" : "bg-white/90 text-ink"}`}>
                  {it.tag}
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base text-ink">{it.name}</h3>
                  <p className="mt-0.5 text-[0.7rem] uppercase tracking-[0.12em] text-ink/40">{it.meta}</p>
                </div>
                <p className="shrink-0 text-right text-sm text-ink/70">{it.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
