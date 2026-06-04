"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Package, Ruler, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutForm } from "@/components/sign-out-form";
import { type Dictionary } from "@/lib/i18n";

interface AccountNavProps {
  t: Dictionary["account"]["nav"];
  showPartnerDashboard?: boolean;
}

/**
 * Sidebar nav for /account/*. Highlights the active route. Client component
 * because it needs usePathname.
 */
export function AccountNav({ t, showPartnerDashboard = false }: AccountNavProps) {
  const pathname = usePathname() ?? "";

  const items = [
    { href: "/account", label: t.profile, icon: User, exact: true },
    { href: "/account/sizing", label: t.sizing, icon: Ruler },
    { href: "/account/bookings", label: t.bookings, icon: Package },
    { href: "/account/wishlist", label: t.wishlist, icon: Heart },
  ];

  return (
    <nav className="flex w-full flex-col gap-1 md:max-w-xs">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-soft-blush text-rose-gold"
                : "text-charcoal/70 hover:bg-soft-blush hover:text-rose-gold",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}

      {showPartnerDashboard ? (
        <Link
          href="/partner/dashboard"
          className={cn(
            "mt-2 flex items-center gap-2 rounded-md border border-rose-gold/30 px-3 py-2 text-sm text-rose-gold transition-colors hover:bg-rose-gold hover:text-cream",
          )}
        >
          <Briefcase className="h-4 w-4" />
          {t.partnerDashboard}
        </Link>
      ) : null}

      <div className="mt-4 border-t border-charcoal/10 pt-4">
        <SignOutForm label={t.signOut} variant="link" />
      </div>
    </nav>
  );
}
