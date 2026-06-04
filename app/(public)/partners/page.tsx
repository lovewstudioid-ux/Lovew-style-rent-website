import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Untuk Partner" };

const BENEFITS = [
  "Dashboard self-serve untuk katalog, kalender, dan booking",
  "Komisi 15% dari rental subtotal — deposit & ongkir tidak kena komisi",
  "Payout mingguan T+7 setelah booking selesai",
  "Deposit ditahan LOVEW sebagai escrow — kamu terlindungi dari klaim sepihak",
  "Notifikasi WhatsApp + email otomatis ke customer",
  "Halaman storefront yang siap di-share ke IG/TikTok",
];

export default function PartnerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-cream">
        <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
          <p className="text-xs uppercase tracking-widest text-rose-gold">
            Untuk pemilik bisnis sewa dress
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-charcoal md:text-5xl">
            Buka pintu ke ribuan customer baru.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal/70">
            Jualan di Instagram tetap jalan. Kami bantu kamu dapat customer
            tambahan tanpa repot bales chat satu-satu.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/partner/onboard">Daftar jadi partner</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="#benefits">Lihat keuntungannya</Link>
            </Button>
          </div>
        </section>

        <section id="benefits" className="mx-auto max-w-4xl px-6 pb-24">
          <h2 className="font-display text-3xl font-semibold text-charcoal">
            Yang kamu dapat
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 rounded-2xl border border-charcoal/10 bg-cream p-5"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-sage" />
                <p className="text-sm leading-relaxed text-charcoal/80">{b}</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl bg-soft-blush p-8 text-center">
            <h3 className="font-display text-2xl font-semibold text-charcoal">
              Siap mulai?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-charcoal/70">
              Daftar gratis. Tim LOVEW akan verifikasi dalam 1×24 jam.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/partner/onboard">Daftar sekarang</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
