import Link from "next/link";
import { Package, Users, ShieldCheck, AlertOctagon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/format";

export const metadata = { title: "Admin · LOVEW Style" };

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    bookingsThisMonth,
    activePartners,
    activeDresses,
    pendingPayments,
    openClaims,
    refundsDue,
    gmvMonthData,
  ] = await Promise.all([
    countBookingsThisMonth(supabase),
    supabase.from("partners").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("dresses").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending_payment"),
    supabase.from("damage_claims").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("deposit_status", "refund_pending")
      .lt("deposit_due_back_at", new Date().toISOString()),
    gmvThisMonth(supabase),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">Dashboard</h1>
        <p className="mt-1 text-sm text-charcoal/70">
          Ringkasan operasional LOVEW Style.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="GMV bulan ini" value={formatIDR(gmvMonthData)} icon={Package} />
        <KpiCard label="Booking bulan ini" value={String(bookingsThisMonth)} icon={Package} />
        <KpiCard label="Partner aktif" value={String(activePartners.count ?? 0)} icon={Users} />
        <KpiCard label="Dress aktif" value={String(activeDresses.count ?? 0)} icon={Package} />
        <KpiCard
          label="Menunggu konfirmasi"
          value={String(pendingPayments.count ?? 0)}
          icon={Package}
          href="/admin/bookings?status=pending_payment"
          tone="rose"
        />
        <KpiCard
          label="Refund jatuh tempo"
          value={String(refundsDue.count ?? 0)}
          icon={ShieldCheck}
          href="/admin/deposits"
          tone="sage"
        />
        <KpiCard
          label="Sengketa terbuka"
          value={String(openClaims.count ?? 0)}
          icon={AlertOctagon}
          href="/admin/disputes"
          tone="orange"
        />
      </div>
    </div>
  );
}

async function countBookingsThisMonth(
  supabase: ReturnType<typeof createClient>,
): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", start.toISOString());
  return count ?? 0;
}

async function gmvThisMonth(
  supabase: ReturnType<typeof createClient>,
): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("bookings")
    .select("rental_subtotal_idr")
    .in("status", ["confirmed", "in_use", "returned", "completed"])
    .gte("created_at", start.toISOString());
  return (data ?? []).reduce((s, r) => s + (r.rental_subtotal_idr ?? 0), 0);
}

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: "neutral" | "rose" | "sage" | "orange";
}) {
  const toneRing =
    tone === "rose"
      ? "bg-rose-gold/10 text-rose-gold"
      : tone === "sage"
        ? "bg-sage/10 text-sage"
        : tone === "orange"
          ? "bg-orange-500/10 text-orange-600"
          : "bg-soft-blush text-charcoal";
  const Inner = (
    <div className="rounded-2xl border border-charcoal/10 bg-cream p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-charcoal/50">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${toneRing}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl text-charcoal">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{Inner}</Link> : Inner;
}
