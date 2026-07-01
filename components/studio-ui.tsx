"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICES } from "@/lib/studio";
import { signOut } from "@/app/actions/auth";
import type { AccountNav } from "@/lib/account-nav";

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

/* ─── Account menu (desktop) ────────────────────────────────────────────── */
function initials(name: string, email: string): string {
  const src = (name && name.trim()) || (email && email.split("@")[0]) || "?";
  const parts = src.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Small checklist row inside the account dropdown. */
function SetupRow({ done, label, href, onGo }: { done: boolean; label: string; href: string; onGo: () => void }) {
  return (
    <Link
      href={href}
      onClick={onGo}
      className="flex items-center justify-between px-4 py-2 transition-colors hover:bg-[#faf8f5]"
    >
      <span className="flex items-center gap-2 text-[0.78rem] text-ink/75">
        <span
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[0.6rem] ${
            done ? "bg-eucalyptus text-white" : "border border-wine/50 text-wine"
          }`}
        >
          {done ? "✓" : "!"}
        </span>
        {label}
      </span>
      <span className="text-[0.62rem] uppercase tracking-[0.12em] text-ink/40">
        {done ? "Done" : "Set up →"}
      </span>
    </Link>
  );
}

function AccountMenu({ account }: { account: AccountNav }) {
  const [open, setOpen] = useState(false);
  const incomplete = !account.hasStyleId || !account.hasMeasurements;
  const first = (account.name || "").split(" ")[0] || "Account";

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-wine text-[0.72rem] font-medium tracking-wide text-chiffon"
        aria-label="Account menu"
      >
        {initials(account.name, account.email)}
        {incomplete && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-64 border border-ink/10 bg-white shadow-lg">
          {/* Identity */}
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="font-display text-lg leading-tight text-ink">{first}</p>
            <p className="truncate text-[0.7rem] text-ink/45">{account.email}</p>
          </div>

          {/* Setup checklist */}
          <div className="border-b border-ink/10 py-1">
            <p className="px-4 pb-1 pt-2 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-ink/35">
              Your Style ID
            </p>
            <SetupRow done={account.hasStyleId} label="Colour & style analysis" href="/discover" onGo={() => setOpen(false)} />
            <SetupRow done={account.hasMeasurements} label="Body measurements" href="/discover" onGo={() => setOpen(false)} />
          </div>

          {/* Tool links */}
          <div className="border-b border-ink/10 py-1">
            {FREE_TOOLS.filter((t) => t.href !== "/discover").map((t) => (
              <Link
                key={t.name}
                href={t.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[0.78rem] text-ink/70 transition-colors hover:bg-[#faf8f5] hover:text-wine"
              >
                {t.name}
              </Link>
            ))}
          </div>

          {/* Sign out */}
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full px-4 py-2.5 text-left text-[0.78rem] text-ink/60 transition-colors hover:bg-[#faf8f5] hover:text-wine"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
export function StudioHeader({ account }: { account?: AccountNav | null }) {
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
          {account ? (
            <div className="hidden lg:block">
              <AccountMenu account={account} />
            </div>
          ) : (
            <Link
              href="/discover"
              className="hidden border-b border-ink/30 pb-1 text-[0.72rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-wine hover:text-wine lg:block"
            >
              Sign in
            </Link>
          )}

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

            {/* Account */}
            {account ? (
              <div className="border-t border-ink/10 pt-6">
                <p className="mb-1 font-display text-lg text-ink">
                  {(account.name || "").split(" ")[0] || "Account"}
                </p>
                <p className="mb-3 truncate text-[0.7rem] text-ink/45">{account.email}</p>
                <div className="space-y-2">
                  <Link
                    href="/discover"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-[0.85rem] text-ink/75 hover:text-wine"
                  >
                    <span className={account.hasStyleId ? "text-eucalyptus" : "text-wine"}>
                      {account.hasStyleId ? "✓" : "!"}
                    </span>
                    Colour &amp; style analysis
                  </Link>
                  <Link
                    href="/discover"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-[0.85rem] text-ink/75 hover:text-wine"
                  >
                    <span className={account.hasMeasurements ? "text-eucalyptus" : "text-wine"}>
                      {account.hasMeasurements ? "✓" : "!"}
                    </span>
                    Body measurements
                  </Link>
                </div>
                <form action={signOut} className="mt-4">
                  <button
                    type="submit"
                    className="text-[0.72rem] uppercase tracking-[0.2em] text-ink/50 hover:text-wine"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/discover"
                onClick={() => setMenuOpen(false)}
                className="block border-t border-ink/10 pt-6 text-[0.72rem] uppercase tracking-[0.2em] text-ink/60 hover:text-wine"
              >
                Sign in
              </Link>
            )}
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
