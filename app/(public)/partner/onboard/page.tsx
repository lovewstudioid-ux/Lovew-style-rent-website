import { Construction } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Pendaftaran partner" };

/**
 * Onboarding wizard placeholder. The 4-step form (brand / ops / payouts /
 * agreement) ships in a future iteration — middleware lets any signed-in
 * customer reach this page.
 */
export default function PartnerOnboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <Construction className="mx-auto h-10 w-10 text-rose-gold" />
          <h1 className="mt-4 font-display text-3xl font-semibold text-charcoal">
            Pendaftaran partner segera dibuka
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/70">
            Sambil kami siapkan formulir self-serve, langsung kirim WhatsApp ke
            tim LOVEW di{" "}
            <a
              href="https://wa.me/6281234567890"
              className="font-medium text-rose-gold hover:underline"
            >
              +62 812-3456-7890
            </a>{" "}
            dan kami bantu onboarding kamu manual dulu — gratis.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
