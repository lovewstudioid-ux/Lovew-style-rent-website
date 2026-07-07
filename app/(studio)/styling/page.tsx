import { Label } from "@/components/studio-ui";
import { PortfolioGallery, type PortfolioSection } from "@/components/portfolio-gallery";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { inquiryUrl } from "@/lib/inquiry";

export const metadata = { title: "LOVEW Styling — Our works · LOVEW Studio" };
export const dynamic = "force-dynamic";

const INQUIRY = "https://tally.so/r/Gxd6ZL";

/** Pre-fill the styling inquiry form from the signed-in user's profile. */
async function getInquiry(): Promise<string> {
  if (!env.supabaseConfigured) return INQUIRY;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return INQUIRY;
    const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
    return inquiryUrl(INQUIRY, {
      name: (profile?.full_name as string) ?? "",
      email: user.email ?? "",
      phone: (profile?.phone as string) ?? "",
    });
  } catch {
    return INQUIRY;
  }
}
// Full slide range (downloaded): /portfolio/s-N.jpg
const r = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => `/portfolio/s-${a + i}.jpg`);

const SECTIONS: PortfolioSection[] = [
  {
    key: "commercial",
    label: "Brand / Commercial",
    projects: [
      { name: "OUI | May 2026", cover: "/portfolio/s-3.jpg", images: r(3, 17) },
      { name: "ROAM | May 2026", cover: "/portfolio/s-18.jpg", images: r(18, 26) },
      { name: "SEYA | Raya 2026", cover: "/portfolio/s-27.jpg", images: r(27, 32) },
      { name: "LIMAN | Raya 2026", cover: "/portfolio/s-33.jpg", images: r(33, 39) },
      { name: "PIXY | Liquid Blush", cover: "/portfolio/s-40.jpg", images: r(40, 42) },
      { name: "ROAM | Raya 2026", cover: "/portfolio/s-43.jpg", images: r(43, 47) },
      { name: "ROAM | CNY 2026", cover: "/portfolio/s-48.jpg", images: r(48, 50) },
      { name: "OUI | Raya 2026", cover: "/portfolio/s-51.jpg", images: r(51, 55) },
      { name: "GAUDI | End Year Holiday 2025", cover: "/portfolio/s-56.jpg", images: r(56, 59) },
      { name: "SEVERLI", cover: "/portfolio/s-60.jpg", images: r(60, 62) },
      { name: "FUEL", cover: "/portfolio/s-63.jpg", images: r(63, 64) },
      { name: "CASE BIBLE", cover: "/portfolio/s-65.jpg", images: r(65, 66) },
      { name: "ECINOS | 2025", cover: "/portfolio/s-67.jpg", images: r(67, 84) },
      { name: "OUI | First Collection", cover: "/portfolio/s-86.jpg", images: r(86, 88) },
      { name: "ESMOD", cover: "/portfolio/s-101.jpg", images: r(101, 103) },
    ],
  },
  {
    key: "personal",
    label: "Personal",
    projects: [
      { name: "Adinda Latief", cover: "/portfolio/s-88.jpg", images: r(88, 91) },
      { name: "Hanami Wang", cover: "/portfolio/s-92.jpg", images: r(92, 93) },
      { name: "Jessica Kusiki", cover: "/portfolio/s-94.jpg", images: r(94, 97) },
      { name: "Brenda", cover: "/portfolio/s-98.jpg", images: r(98, 100) },
      { name: "Virtual Styling", cover: "/portfolio/s-110.jpg", images: r(110, 113) },
    ],
  },
];

const TESTIMONIALS = [
  { quote: "You've been super helpful from creating marketing initiatives to execution. Organized and thorough even when we were crazy — we're super grateful, and so happy to have you as part of our team.", name: "Michelle", brand: "ODIVA" },
  { quote: "I love your stories and all your work. It's hard for me to find someone with the same taste.", name: "Lany", brand: "Laboo" },
];

export default async function StylingPage() {
  const inquiry = await getInquiry();
  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-20 text-center md:py-28">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW Styling</p>
          <h1 className="mt-6 font-display text-5xl font-normal text-chiffon md:text-7xl">Our works</h1>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-16 md:py-20">
        <PortfolioGallery sections={SECTIONS} inquiry={inquiry} />
      </section>

      <section className="border-t border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto max-w-editorial px-6 py-20 md:py-24">
          <div className="text-center">
            <Label className="mx-auto">Kind words</Label>
            <h2 className="mt-4 font-display text-4xl font-normal text-ink md:text-5xl">From the people we work with.</h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
            {TESTIMONIALS.map((t) => (
              <figure key={t.brand} className="border-t border-ink/15 pt-7">
                <blockquote className="font-display text-xl font-normal italic leading-relaxed text-ink md:text-2xl">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-[0.72rem] uppercase tracking-[0.18em] text-ink/55">{t.name} · <span className="text-wine">{t.brand}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
