import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusPill, DepositPill } from "@/components/booking/status-pill";

export const metadata = { title: "Booking · Admin" };

const STATUS_TABS = [
  { value: "", label: "Semua" },
  { value: "pending_payment", label: "Menunggu" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "in_use", label: "Dipakai" },
  { value: "returned", label: "Dikembalikan" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
  { value: "disputed", label: "Sengketa" },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, deposit_status,
      start_date, end_date, rental_days, total_idr, created_at,
      dresses ( title, partners ( brand_name ) ),
      profiles!bookings_customer_id_fkey ( full_name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: rows } = await query;
  const t = getDictionary(defaultLocale).bookings;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">Booking</h1>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const active = (searchParams.status ?? "") === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={tab.value ? `/admin/bookings?status=${tab.value}` : "/admin/bookings"}
              className={
                active
                  ? "rounded-full bg-rose-gold px-3 py-1 text-xs text-cream"
                  : "rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70 hover:border-charcoal/40"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {!rows || rows.length === 0 ? (
        <p className="text-sm text-charcoal/60">Belum ada booking.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-sm">
            <thead className="bg-soft-blush text-left text-xs uppercase tracking-widest text-charcoal/60">
              <tr>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Dress</th>
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 bg-cream">
              {rows.map((r) => {
                const dress = Array.isArray(r.dresses) ? r.dresses[0] : r.dresses;
                const partner = dress
                  ? Array.isArray(dress.partners)
                    ? dress.partners[0]
                    : dress.partners
                  : null;
                const customer = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
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
                      {formatDate(r.start_date)} – {formatDate(r.end_date)}
                      <br />
                      <span className="text-[11px] text-charcoal/50">
                        ({r.rental_days} hari)
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatIDR(r.total_idr)}</td>
                    <td className="px-3 py-2">
                      <StatusPill status={r.status} t={t.status} />
                    </td>
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
    </div>
  );
}
