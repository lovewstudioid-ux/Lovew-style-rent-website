import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/format";

export const metadata = { title: "Payout · Admin" };

export default async function AdminPayoutsPage() {
  const supabase = createClient();

  // Pending payouts: completed bookings not yet attached to a payouts row.
  const { data: pendingRows } = await supabase
    .from("bookings")
    .select(
      `
      id, partner_payout_idr,
      partners ( brand_name )
    `,
    )
    .eq("status", "completed");

  // Group by partner.
  const byPartner = new Map<string, { name: string; total: number; count: number }>();
  for (const r of pendingRows ?? []) {
    const partner = Array.isArray(r.partners) ? r.partners[0] : r.partners;
    const key = partner?.brand_name ?? "—";
    const prev = byPartner.get(key) ?? { name: key, total: 0, count: 0 };
    prev.total += r.partner_payout_idr ?? 0;
    prev.count += 1;
    byPartner.set(key, prev);
  }
  const groups = [...byPartner.values()].sort((a, b) => b.total - a.total);
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">Payout</h1>
        <p className="mt-1 text-sm text-charcoal/70">
          Ringkasan payout pending per partner. Generate batch mingguan setiap Senin.
        </p>
      </header>

      <section className="rounded-2xl border border-charcoal/10 bg-cream p-6">
        <p className="text-xs uppercase tracking-widest text-charcoal/50">
          Total pending payout
        </p>
        <p className="mt-2 font-display text-3xl text-charcoal">{formatIDR(grandTotal)}</p>
      </section>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
          <Wallet className="mx-auto h-10 w-10 text-charcoal/30" />
          <p className="mt-3 font-display text-2xl text-charcoal">
            Belum ada payout pending
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li
              key={g.name}
              className="flex items-center justify-between rounded-xl border border-charcoal/10 bg-cream px-5 py-3"
            >
              <div>
                <p className="font-medium text-charcoal">{g.name}</p>
                <p className="text-xs text-charcoal/60">{g.count} booking selesai</p>
              </div>
              <p className="font-medium text-charcoal">{formatIDR(g.total)}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-charcoal/50">
        Fitur "Generate batch + CSV export" akan ditambahkan setelah partner
        dashboard live.
      </p>
    </div>
  );
}
