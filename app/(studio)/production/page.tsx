import { PortfolioGallery, type PortfolioSection } from "@/components/portfolio-gallery";

export const metadata = { title: "LOVEW Production — Our works · LOVEW Studio" };

const INQUIRY = "https://tally.so/r/Gxd6ZL";
// Full slide range (downloaded): /portfolio/p-N.jpg. Cover = first slide.
const r = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => `/portfolio/p-${a + i}.jpg`);
const c = (n: number) => `/portfolio/p-${n}.jpg`;

const SECTIONS: PortfolioSection[] = [
  {
    key: "commercial",
    label: "Brand / Commercial",
    blurb: "Producing and directing catalog, campaign, and lookbook for fashion & beauty brands — concept to final cut.",
    services: ["Production & direction", "Styling & art direction", "Content production — 3×3, reels, editing"],
    projects: [
      { name: "OUI | May 2026", cover: c(6), images: r(6, 20) },
      { name: "ROAM | May 2026", cover: c(21), images: r(21, 31) },
      { name: "SEYA | Raya 2026", cover: c(32), images: r(32, 37) },
      { name: "LIMAN | Raya 2026", cover: c(38), images: r(38, 44) },
      { name: "ROAM | Raya 2026", cover: c(48), images: r(48, 53) },
      { name: "ROAM | CNY 2026", cover: c(54), images: r(54, 57) },
      { name: "OUI | Raya 2026", cover: c(58), images: r(58, 63) },
      { name: "SEVERLI", cover: c(68), images: r(68, 71) },
      { name: "ECINOS | 2025", cover: c(72), images: r(72, 87) },
      { name: "OUI | First Collection", cover: c(93), images: r(93, 95) },
      { name: "ESMOD", cover: c(107), images: r(107, 109) },
    ],
  },
  {
    key: "personal",
    label: "Personal / Group",
    blurb: "Personal, group, and editorial shoots — styled and directed end to end, with full creative direction.",
    services: ["Concept & moodboard creation", "Styling & wardrobe", "Make-up & hair direction"],
    projects: [
      { name: "Adinda Latief", cover: c(97), images: r(97, 100) },
      { name: "Hanami Wang", cover: c(101), images: r(101, 102) },
      { name: "Jessica Kusiki", cover: c(103), images: r(103, 106) },
    ],
  },
  {
    key: "pm",
    label: "Project Management",
    blurb: "Managing productions end to end — timelines, talent, props, and budget — including freelance work at Open Season Studio.",
    services: ["Timeline & team coordination", "Styling, props & budget", "End-to-end production"],
    projects: [
      { name: "M231", cover: c(119), images: r(119, 120) },
      { name: "Ultra Milk 270ml", cover: c(121), images: r(121, 122) },
    ],
  },
  {
    key: "social",
    label: "Social Media Management",
    blurb: "Strategy, content creation, and growth for brands — from plan to scheduling and posting.",
    services: ["Strategy & content plan", "Content creation & editing", "Scheduling & posting"],
    projects: [{ name: "Social Media", cover: c(125), images: r(125, 129) }],
  },
  {
    key: "marketing",
    label: "Fashion Marketing",
    blurb: "Working with fashion influencers — KOL/influencer management and public relations.",
    services: ["Influencer & KOL management", "Public relations"],
    projects: [{ name: "ODIVA", cover: c(139), images: r(139, 141) }],
  },
];

export default function ProductionPage() {
  return (
    <>
      {/* Hero — wine band */}
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-20 text-center md:py-28">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW Production</p>
          <h1 className="mt-6 font-display text-5xl font-normal text-chiffon md:text-7xl">Our works</h1>
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-editorial px-6 py-16 md:py-20">
        <PortfolioGallery sections={SECTIONS} inquiry={INQUIRY} />
      </section>
    </>
  );
}
