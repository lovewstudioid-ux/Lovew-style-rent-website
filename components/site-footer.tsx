import Link from "next/link";
import { brand } from "@/lib/brand";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Monogram } from "@/components/wordmark";

export function SiteFooter({ locale = "en" as Locale }: { locale?: Locale }) {
  const t = getDictionary(locale).footer;
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: "LOVEW Style",
      links: [
        { href: "/browse", label: "Browse the collection" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/partners", label: "List your collection" },
        { href: "/about", label: "About" },
      ],
    },
    {
      heading: "LOVEW Studio",
      links: [
        { href: brand.urls.parent, label: "lovew.studio", external: true },
        { href: brand.social.instagram, label: "Instagram", external: true },
      ],
    },
  ];

  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-editorial gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-5">
          {/* Footer logo links to the parent brand site. */}
          <a
            href={brand.urls.parent}
            className="inline-flex items-center gap-3 text-wine"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Monogram size={44} />
            <span className="font-display text-2xl font-semibold tracking-[0.04em]">
              {brand.parent}
            </span>
          </a>
          <p className="text-sm leading-relaxed text-ink/70">{t.built}</p>
          <p className="text-xs text-ink/50">{t.parentLine}</p>
        </div>

        {columns.map((col) => (
          <div key={col.heading} className="space-y-3">
            <p className="eyebrow text-ink/60">{col.heading}</p>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-ink/70 transition-colors hover:text-wine"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-editorial flex-col gap-2 px-6 py-5 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.parent}. {t.rights}
          </p>
          <p className="uppercase tracking-[0.18em]">
            {brand.cities.join(" · ")}
          </p>
        </div>
      </div>
    </footer>
  );
}
