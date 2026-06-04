"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Image as ImageIcon, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";

interface PartnerNavProps {
  t: Dictionary["partner"]["nav"];
}

export function PartnerNav({ t }: PartnerNavProps) {
  const pathname = usePathname() ?? "";
  const items = [
    { href: "/partner/dashboard", label: t.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/partner/bookings", label: t.bookings, icon: Package },
    { href: "/partner/catalog", label: t.catalog, icon: ImageIcon },
    { href: "/partner/payouts", label: t.payouts, icon: Wallet },
    { href: "/partner/settings", label: t.settings, icon: Settings },
  ];
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-rose-gold text-cream"
                : "text-charcoal/70 hover:bg-soft-blush hover:text-charcoal",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
