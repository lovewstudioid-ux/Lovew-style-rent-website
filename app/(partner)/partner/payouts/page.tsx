import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatIDR, formatDate } from "@/lib/format";

export const metadata = { title: "Payout · Partner" };

export default async function PartnerPayoutsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!partner) return null;

  // Pending: completed bookings whose payout hasn't been batched.
  const { data: pendingRows } = await supabase
    .from("bookings")
    .select("partner_payout_idr")
    .eq("partner_id", partner.id)
    .eq("status", "completed");
  const pendingTotal = (pendingRows ?? []).reduce(
    (s, r) => s + (r.partner_payout_idr ?? 0),
    0,
  );

  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, period_start, period_end, gross_idr, commission_idr, net_idr, status, bank_ref, paid_at")
    .eq("partner_id", partner.id)
    .order("period_end", { ascending: false });

  const t = getDictionary(defaultLocale).partner.payouts;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">{t.title}</h1>
      </header>

      <section className="rounded-2xl border border-rose-gold/30 bg-rose-gold/5 p-6">
        <p className="text-xs uppercase tracking-widest text-charcoal/50">{t.pending}</p>
        <p className="mt-2 font-display text-3xl text-charcoal">{formatIDR(pendingTotal)}</p>
        <p className="mt-2 text-xs text-charcoal/60">
          Dibayar mingguan oleh tim LOVEW (T+7 setelah booking selesai).
        </p>
      </section>

      {!payouts || payouts.length === 0 ? (
        <p className="text-sm text-charcoal/60">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-sm">
            <thead className="bg-soft-blush text-left text-xs uppercase tracking-widest text-charcoal/60">
              <tr>
                <th className="px-3 py-2">Periode</th>
                <th className="px-3 py-2">Gross</th>
                <th className="px-3 py-2">Komisi</th>
                <th className="px-3 py-2">Net</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 bg-cream">
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">
                    {formatDate(p.period_start)} – {formatDate(p.period_end)}
                  </td>
                  <td className="px-3 py-2">{formatIDR(p.gross_idr)}</td>
                  <td className="px-3 py-2 text-charcoal/60">− {formatIDR(p.commission_idr)}</td>
                  <td className="px-3 py-2 font-medium">{formatIDR(p.net_idr)}</td>
                  <td className="px-3 py-2 capitalize">{p.status}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.bank_ref ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
