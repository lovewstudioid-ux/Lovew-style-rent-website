"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShieldCheck,
  Wallet,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Booking", icon: Package },
  { href: "/admin/partners", label: "Partner", icon: Users },
  { href: "/admin/deposits", label: "Deposit", icon: ShieldCheck },
  { href: "/admin/disputes", label: "Sengketa", icon: AlertOctagon },
  { href: "/admin/payouts", label: "Payout", icon: Wallet },
];

export function AdminNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
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
