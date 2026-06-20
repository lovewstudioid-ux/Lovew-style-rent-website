import type { DigitalProduct } from "@/lib/digitals";

/** Public shop grid. Each card links out to the external checkout (buy_url). */
export function DigitalsShop({ products }: { products: DigitalProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="border-t border-ink/10 pt-16 text-center">
        <p className="font-display text-2xl text-ink/40">Templates coming soon.</p>
        <p className="mt-2 text-sm font-light text-ink/45">New digital designs are on the way — check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
      {products.map((p) => (
        <div key={p.id} className="group flex flex-col">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ef]">
            {p.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
            )}
            <span className="absolute left-2 top-2 bg-white/90 px-2 py-0.5 text-[0.56rem] uppercase tracking-[0.12em] text-ink">{p.category}</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-2">
            <h3 className="font-display text-base leading-tight text-ink">{p.title}</h3>
            {p.price && <p className="whitespace-nowrap text-sm text-ink/70">{p.price}</p>}
          </div>
          {p.description && <p className="mt-1 line-clamp-2 text-[0.8rem] font-light leading-relaxed text-ink/55">{p.description}</p>}
          <div className="mt-3">
            {p.buy_url ? (
              <a href={p.buy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine">
                Buy &amp; download →
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 border border-ink/20 px-5 py-2.5 text-[0.7rem] uppercase tracking-[0.18em] text-ink/40">Coming soon</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
