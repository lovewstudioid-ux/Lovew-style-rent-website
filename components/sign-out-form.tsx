"use client";

import { signOut } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small form that posts to the signOut server action. Renders as a sidebar
 * link by default; pass `variant="button"` for a standalone button.
 */
export function SignOutForm({
  label,
  variant = "link",
  className,
}: {
  label: string;
  variant?: "link" | "button";
  className?: string;
}) {
  return (
    <form action={signOut} className={className}>
      <button
        type="submit"
        className={cn(
          variant === "link" &&
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-charcoal/70 hover:bg-soft-blush hover:text-rose-gold",
          variant === "button" &&
            "inline-flex h-9 items-center gap-2 rounded-md border border-charcoal/20 px-4 text-sm text-charcoal hover:bg-soft-blush",
        )}
      >
        <LogOut className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
