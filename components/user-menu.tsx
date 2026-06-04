"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Package, Ruler, User as UserIcon, Briefcase, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutForm } from "@/components/sign-out-form";
import type { Dictionary } from "@/lib/i18n";

interface UserMenuProps {
  initials: string;
  displayName: string;
  email: string;
  t: Dictionary["account"]["nav"];
  showPartnerDashboard?: boolean;
}

/**
 * Avatar button with a dropdown. Used in SiteHeader for logged-in users.
 */
export function UserMenu({
  initials,
  displayName,
  email,
  t,
  showPartnerDashboard = false,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const items = [
    { href: "/account", label: t.profile, icon: UserIcon },
    { href: "/account/sizing", label: t.sizing, icon: Ruler },
    { href: "/account/bookings", label: t.bookings, icon: Package },
    { href: "/account/wishlist", label: t.wishlist, icon: Heart },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-charcoal/15 bg-cream py-1 pl-1 pr-3 text-sm transition-colors hover:border-rose-gold",
          open && "border-rose-gold",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-gold/15 text-xs font-semibold text-rose-gold">
          {initials}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-charcoal/50" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg border border-charcoal/10 bg-cream p-2 shadow-lg"
        >
          <div className="border-b border-charcoal/10 px-3 py-2">
            <p className="text-sm font-medium text-charcoal">{displayName}</p>
            <p className="truncate text-xs text-charcoal/50">{email}</p>
          </div>

          <ul className="mt-1 space-y-0.5">
            {items.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-charcoal/80 hover:bg-soft-blush hover:text-rose-gold"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}

            {showPartnerDashboard ? (
              <li>
                <Link
                  href="/partner/dashboard"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-gold hover:bg-rose-gold hover:text-cream"
                >
                  <Briefcase className="h-4 w-4" />
                  {t.partnerDashboard}
                </Link>
              </li>
            ) : null}
          </ul>

          <div className="mt-1 border-t border-charcoal/10 pt-1">
            <SignOutForm label={t.signOut} variant="link" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
