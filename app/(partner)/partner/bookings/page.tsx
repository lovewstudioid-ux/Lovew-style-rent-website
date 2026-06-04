import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusPill, DepositPill } from "@/components/booking/status-pill";

export const metadata = { title: "Booking · Partner" };

const FILTER_MAP: Record<string, string[]> = {
  all: [],
  pending: ["pending_payment"],
  confirmed: ["confirmed"],
  in_use: ["in_use"],
  returned: ["returned", "disputed"],
  completed: ["completed", "cancelled"],
};

export default async function PartnerBookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
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

  const tab = (searchParams.tab && FILTER_MAP[searchParams.tab] ? searchParams.tab : "all") as keyof typeof FILTER_MAP;
  const filterValues = FILTER_MAP[tab];

  let query = supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, deposit_status,
      start_date, end_date, rental_days, total_idr, created_at,
      dresses ( title, slug ),
      dress_variants ( size_label ),
      profiles!bookings_customer_id_fkey ( full_name )
    `,
    )
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });

  if (filterValues.length > 0) query = query.in("status", filterValues);

  const { data: rows } = await query;

  const t = getDictionary(defaultLocale);
  const tp = t.partner.bookings;
  const tb = t.bookings;

  const TABS: { key: keyof typeof FILTER_MAP; label: string }[] = [
    { key: "all", label: tp.tabAll },
    { key: "pending", label: tp.tabPending },
    { key: "confirmed", label: tp.tabConfirmed },
    { key: "in_use", label: tp.tabInUse },
    { key: "returned", label: tp.tabReturned },
    { key: "completed", label: tp.tabCompleted },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          {tp.title}
        </h1>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((x) => {
          const active = tab === x.key;
          return (
            <Link
              key={x.key}
              href={x.key === "all" ? "/partner/bookings" : `/partner/bookings?tab=${x.key}`}
              className={
                active
                  ? "rounded-full bg-rose-gold px-3 py-1 text-xs text-cream"
                  : "rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70 hover:border-charcoal/40"
              }
            >
              {x.label}
            </Link>
          );
        })}
      </div>

      {!rows || rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-charcoal/30" />
          <p className="mt-3 font-display text-2xl text-charcoal">{tp.empty}</p>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 bg-cream">
              {rows.map((row) => {
                const dress = Array.isArray(row.dresses) ? row.dresses[0] : row.dresses;
                const variant = Array.isArray(row.dress_variants)
                  ? row.dress_variants[0]
                  : row.dress_variants;
                const customer = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
                return (
                  <tr key={row.id} className="hover:bg-soft-blush/30">
                    <td className="px-3 py-2 font-mono text-xs">
                      <Link
                        href={`/partner/bookings/${row.id}`}
                        className="text-rose-gold hover:underline"
                      >
                        {row.booking_code}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{customer?.full_name ?? "—"}</td>
                    <td className="px-3 py-2">
                      {dress?.title}
                      {variant?.size_label ? (
                        <span className="ml-1 text-[11px] text-charcoal/50">
                          · {variant.size_label}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {formatDate(row.start_date)} – {formatDate(row.end_date)}
                      <br />
                      <span className="text-charcoal/50">{row.rental_days} hari</span>
                    </td>
                    <td className="px-3 py-2 text-charcoal">{formatIDR(row.total_idr)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-start gap-1">
                        <StatusPill status={row.status} t={tb.status} />
                        <DepositPill status={row.deposit_status} t={tb.deposit} />
                      </div>
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
