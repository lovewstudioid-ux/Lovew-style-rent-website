import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n";

type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "in_use"
  | "returned"
  | "completed"
  | "cancelled"
  | "disputed";

const TONE: Record<BookingStatus, string> = {
  pending_payment: "bg-rose-gold/10 text-rose-gold",
  confirmed: "bg-sage/10 text-sage",
  in_use: "bg-blue-500/10 text-blue-600",
  returned: "bg-purple-500/10 text-purple-600",
  completed: "bg-charcoal/10 text-charcoal",
  cancelled: "bg-charcoal/5 text-charcoal/40",
  disputed: "bg-orange-500/10 text-orange-600",
};

export function StatusPill({
  status,
  t,
}: {
  status: string | null | undefined;
  t: Dictionary["bookings"]["status"];
}) {
  const key = (status ?? "pending_payment") as BookingStatus;
  const tone = TONE[key] ?? TONE.pending_payment;
  const label = t[key] ?? key;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone,
      )}
    >
      {label}
    </span>
  );
}

const DEP_TONE: Record<string, string> = {
  held: "bg-sage/10 text-sage",
  refund_pending: "bg-rose-gold/10 text-rose-gold",
  refunded: "bg-charcoal/10 text-charcoal",
  partially_withheld: "bg-orange-500/10 text-orange-600",
  forfeited: "bg-red-500/10 text-red-600",
  not_required: "bg-charcoal/5 text-charcoal/40",
};

export function DepositPill({
  status,
  t,
}: {
  status: string | null | undefined;
  t: Dictionary["bookings"]["deposit"];
}) {
  const key = (status ?? "not_required") as keyof Dictionary["bookings"]["deposit"];
  const tone = DEP_TONE[key] ?? DEP_TONE.not_required;
  const label = t[key] ?? "—";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone,
      )}
    >
      {label}
    </span>
  );
}
