import { brand } from "@/lib/brand";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Tentang" };

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-cream">
        <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-widest text-rose-gold">
            Tentang kami
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-charcoal md:text-5xl">
            {brand.taglines.parent}
          </h1>

          <div className="mt-10 space-y-6 text-base leading-relaxed text-charcoal/80">
            <p>
              {brand.product} adalah marketplace sewa busana yang menyatukan
              penyewa independen terpercaya se-Indonesia — mulai dari Jakarta,
              Surabaya, Bali, hingga Bandung — dalam satu platform yang mudah
              dicari dan dipesan.
            </p>
            <p>
              Kami percaya momen spesial — pernikahan, tunangan, wisuda,
              pemotretan — pantas dapat busana yang tepat tanpa harus beli
              baru. Sewa adalah cara yang lebih bijak, lebih berkelanjutan, dan
              seringkali lebih cantik.
            </p>
            <p>
              {brand.product} adalah produk pertama dari {brand.parent}. Ke
              depan kami akan menghadirkan {""}
              <span className="text-wine">LOVEW Spaces</span>{" "}
              — platform booking studio dan ruang acara — sebagai produk
              berikutnya.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
