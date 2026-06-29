"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/lib/studio";

/* ─── Wordmark ──────────────────────────────────────────────────────────── */
export function StudioWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className="font-display text-xl font-semibold tracking-[0.08em]">LOVEW</span>
      <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.4em] text-wine">
        Studio
      </span>
    </span>
  );
}

/* ─── Label ─────────────────────────────────────────────────────────────── */
export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[0.7rem] font-medium uppercase tracking-[0.3em] text-ink/45 ${className}`}>
      {children}
    </p>
  );
}

/* ─── Free tools list (also used in mobile nav) ─────────────────────────── */
const FREE_TOOLS = [
  { name: "Style ID", href: "/discover" },
  { name: "Style Profile", href: "/style-profile" },
  { name: "Wardrobe", href: "/wardrobe" },
  { name: "Gift Registry", href: "/registry" },
  { name: "Event Seating", href: "/event" },
];

/* ─── Tools dropdown (desktop) ──────────────────────────────────────────── */
function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-[0.8rem] text-ink/70 transition-colors hover:text-wine"
      >
        Free tools <span className="text-[0.55rem] opacity-60">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 border border-ink/10 bg-white shadow-lg">
          {FREE_TOOLS.map((t) => (
            <Link
              key={t.name}
              href={t.href}
              className="block px-4 py-2.5 text-[0.78rem] text-ink/70 transition-colors hover:bg-[#faf8f5] hover:text-wine"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
export function StudioHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-editorial items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" aria-label="LOVEW Studio" onClick={() => setMenuOpen(false)}>
          <StudioWordmark className="text-ink" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-[0.8rem] text-ink/70 lg:flex">
          {SERVICES.map((s) => (
            <Link key={s.key} href={s.href} className="transition-colors hover:text-wine">
              {s.name.replace("LOVEW ", "")}
            </Link>
          ))}
          <span className="h-3.5 w-px bg-ink/20" />
          <ToolsDropdown />
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="#contact"
            className="hidden border-b border-ink/30 pb-1 text-[0.72rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-wine hover:text-wine lg:block"
          >
            Contact
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className={`h-px w-6 bg-ink transition-all duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-ink transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-6 bg-ink transition-all duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-ink/10 bg-white lg:hidden">
          <div className="mx-auto max-w-editorial space-y-7 px-6 py-7">
            <div>
              <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-ink/35">
                Services
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {SERVICES.map((s) => (
                  <Link
                    key={s.key}
                    href={s.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[0.88rem] text-ink/75 hover:text-wine"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-ink/35">
                Free tools
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {FREE_TOOLS.map((t) => (
                  <Link
                    key={t.name}
                    href={t.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[0.88rem] text-ink/75 hover:text-wine"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>

            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="block text-[0.72rem] uppercase tracking-[0.2em] text-ink/60 hover:text-wine"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
export function StudioFooter() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-editorial gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <StudioWordmark className="items-start text-wine" />
          <p className="text-sm leading-relaxed text-ink/65">
            A creative house — wardrobe, studios, styling, production, and digitals.
          </p>
        </div>
        <div className="space-y-3">
          <Label>Services</Label>
          <ul className="space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.key}>
                <Link href={s.href} className="text-ink/70 transition-colors hover:text-wine">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <Label>Free tools</Label>
          <ul className="space-y-2.5 text-sm">
            {FREE_TOOLS.map((t) => (
              <li key={t.name}>
                <Link href={t.href} className="text-ink/70 transition-colors hover:text-wine">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <Label>LOVEW Studio</Label>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="https://instagram.com/lovewstudio" target="_blank" rel="noopener noreferrer" className="text-ink/70 hover:text-wine">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://wa.me/6281353752257" target="_blank" rel="noopener noreferrer" className="text-ink/70 hover:text-wine">
                WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:lovewstudioid@gmail.com" className="text-ink/70 hover:text-wine">
                lovewstudioid@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto max-w-editorial px-6 py-5 text-xs text-ink/45">
          © {year} LOVEW Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ─── Contact form (presentational) ─────────────────────────────────────── */
export function ContactForm({ subject = "Enquiry" }: { subject?: string }) {
  const field =
    "w-full border-b border-ink/20 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-wine placeholder:text-ink/35";
  return (
    <form className="grid gap-6 sm:grid-cols-2">
      <input className={field} placeholder="Full name" aria-label="Full name" />
      <input className={field} placeholder="WhatsApp / phone" aria-label="WhatsApp" />
      <input className={field} placeholder="Email" aria-label="Email" />
      <input className={field} placeholder="Event date (optional)" aria-label="Event date" />
      <div className="sm:col-span-2">
        <textarea
          className={`${field} resize-none`}
          rows={3}
          placeholder={`Tell us about your ${subject.toLowerCase()}…`}
          aria-label="Message"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="button"
          className="border border-ink/80 px-8 py-3 text-xs uppercase tracking-[0.24em] text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Send enquiry
        </button>
      </div>
    </form>
  );
}
