import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { DepositPill } from "@/components/booking/status-pill";

export const metadata = { title: "Deposit · Admin" };

export default async function AdminDepositsPage() {
  const supabase = createClient();

  // Refunds-due queue: returned bookings past due date with no open claim.
  const { data: dueRefunds } = await supabase
    .from("bookings")
    .select(
      `
      id, booking_code, deposit_status, deposit_held_idr, deposit_refunded_idr,
      deposit_due_back_at,
      dresses ( title, partners ( brand_name ) ),
      profiles!bookings_customer_id_fkey ( full_name )
    `,
    )
    .eq("deposit_status", "refund_pending")
    .lt("deposit_due_back_at", new Date().toISOString())
    .order("deposit_due_back_at", { ascending: true })
    .limit(50);

  // Reconciliation: total deposits currently held across the platform.
  const { data: heldRows } = await supabase
    .from("bookings")
    .select("deposit_held_idr, deposit_refunded_idr, deposit_withheld_idr")
    .in("deposit_status", ["held", "refund_pending", "partially_withheld"]);
  const totalHeld = (heldRows ?? []).reduce(
    (sum, r) =>
      sum +
      (r.deposit_held_idr ?? 0) -
      (r.deposit_refunded_idr ?? 0) -
      (r.deposit_withheld_idr ?? 0),
    0,
  );

  const t = getDictionary(defaultLocale).bookings;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">Deposit</h1>
        <p className="mt-1 text-sm text-charcoal/70">
          Rekonsiliasi escrow + antrian refund yang jatuh tempo.
        </p>
      </header>

      {/* Reconciliation card */}
      <section className="rounded-2xl border border-charcoal/10 bg-cream p-6">
        <p className="text-xs uppercase tracking-widest text-charcoal/50">
          Total deposit yang ditahan (app)
        </p>
        <p className="mt-2 font-display text-3xl text-charcoal">{formatIDR(totalHeld)}</p>
        <p className="mt-2 text-xs text-charcoal/60">
          Harus sama dengan saldo rekening escrow LOVEW. Cek manual setiap hari.
        </p>
      </section>

      {/* Refunds due */}
      <section>
        <h2 className="mb-3 font-display text-xl text-charcoal">
          Refund jatuh tempo
        </h2>
        {!dueRefunds || dueRefunds.length === 0 ? (
          <p className="text-sm text-charcoal/60">
            Tidak ada deposit yang siap di-refund saat ini. 🌸
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
            <table className="w-full text-sm">
              <thead className="bg-soft-blush text-left text-xs uppercase tracking-widest text-charcoal/60">
                <tr>
                  <th className="px-3 py-2">Kode</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Dress</th>
                  <th className="px-3 py-2">Jatuh tempo</th>
                  <th className="px-3 py-2">Jumlah</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10 bg-cream">
                {dueRefunds.map((r) => {
                  const dress = Array.isArray(r.dresses) ? r.dresses[0] : r.dresses;
                  const partner = dress
                    ? Array.isArray(dress.partners)
                      ? dress.partners[0]
                      : dress.partners
                    : null;
                  const customer = Array.isArray(r.profiles)
                    ? r.profiles[0]
                    : r.profiles;
                  const balance =
                    (r.deposit_held_idr ?? 0) - (r.deposit_refunded_idr ?? 0);
                  return (
                    <tr key={r.id} className="hover:bg-soft-blush/40">
                      <td className="px-3 py-2 font-mono text-xs">
                        <Link
                          href={`/admin/bookings/${r.id}`}
                          className="text-rose-gold hover:underline"
                        >
                          {r.booking_code}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{customer?.full_name ?? "—"}</td>
                      <td className="px-3 py-2">
                        {dress?.title}
                        <br />
                        <span className="text-[11px] text-charcoal/50">
                          {partner?.brand_name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-charcoal/70">
                        {r.deposit_due_back_at
                          ? formatDate(r.deposit_due_back_at)
                          : "—"}
                      </td>
                      <td className="px-3 py-2">{formatIDR(balance)}</td>
                      <td className="px-3 py-2">
                        <DepositPill status={r.deposit_status} t={t.deposit} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-charcoal/50">
          Setelah transfer manual ke customer dari rekening escrow, masuk ke
          detail booking dan catat refund-nya (fitur tombol "Tandai sudah
          refund" akan datang).
        </p>
      </section>
    </div>
  );
}
