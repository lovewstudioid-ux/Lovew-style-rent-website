import Link from "next/link";
import { Package, TrendingUp, Wallet, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatIDR, formatDate } from "@/lib/format";
import { StatusPill } from "@/components/booking/status-pill";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard · Partner" };

export default async function PartnerDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: partner } = await supabase
    .from("partners")
    .select("id, brand_name, rating_avg, rating_count")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!partner) {
    return <NoPartnerYet />;
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [bookingsRes, gmvRes, payoutRes, recentRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partner.id)
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("bookings")
      .select("rental_subtotal_idr")
      .eq("partner_id", partner.id)
      .in("status", ["confirmed", "in_use", "returned", "completed"])
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("bookings")
      .select("partner_payout_idr")
      .eq("partner_id", partner.id)
      .eq("status", "completed"),
    // We don't yet have a payouts table linkage to filter "already paid out".
    supabase
      .from("bookings")
      .select(
        `
        id, booking_code, status, total_idr, created_at,
        dresses ( title )
      `,
      )
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const gmv = (gmvRes.data ?? []).reduce(
    (s, r) => s + (r.rental_subtotal_idr ?? 0),
    0,
  );
  const payout = (payoutRes.data ?? []).reduce(
    (s, r) => s + (r.partner_payout_idr ?? 0),
    0,
  );

  const t = getDictionary(defaultLocale);
  const td = t.partner.dashboard;
  const tb = t.bookings.status;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          {td.greeting}, {partner.brand_name}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={td.kpis.bookingsThisMonth} value={String(bookingsRes.count ?? 0)} icon={Package} />
        <Kpi label={td.kpis.gmvThisMonth} value={formatIDR(gmv)} icon={TrendingUp} />
        <Kpi label={td.kpis.payoutPending} value={formatIDR(payout)} icon={Wallet} />
        <Kpi
          label={td.kpis.rating}
          value={partner.rating_avg ? `${Number(partner.rating_avg).toFixed(1)} (${partner.rating_count ?? 0})` : "—"}
          icon={Star}
        />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-xl text-charcoal">{td.recentBookings}</h2>
          <Link href="/partner/bookings" className="text-xs text-rose-gold hover:underline">
            Lihat semua →
          </Link>
        </div>
        {!recentRes.data || recentRes.data.length === 0 ? (
          <p className="text-sm text-charcoal/60">Belum ada booking.</p>
        ) : (
          <ul className="space-y-2">
            {recentRes.data.map((row) => {
              const dress = Array.isArray(row.dresses) ? row.dresses[0] : row.dresses;
              return (
                <li key={row.id}>
                  <Link
                    href={`/partner/bookings/${row.id}`}
                    className="flex items-center justify-between rounded-2xl border border-charcoal/10 bg-cream p-4 hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-base text-charcoal">
                        {dress?.title ?? "—"}
                      </p>
                      <p className="text-xs text-charcoal/60">
                        <span className="font-mono">{row.booking_code}</span> · {formatDate(row.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-charcoal/80">{formatIDR(row.total_idr)}</span>
                      <StatusPill status={row.status} t={tb} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-cream p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-charcoal/50">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-gold/10 text-rose-gold">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl text-charcoal">{value}</p>
    </div>
  );
}

function NoPartnerYet() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">Partner</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Akun kamu sudah punya akses partner, tapi kami belum melihat profil bisnismu.
        </p>
      </header>
      <div className="rounded-2xl border border-charcoal/10 bg-cream p-6">
        <p className="text-sm text-charcoal/80">
          Hubungi tim LOVEW lewat WhatsApp atau lengkapi pendaftaran partner.
        </p>
        <Button asChild className="mt-4">
          <Link href="/partner/onboard">Lanjutkan pendaftaran</Link>
        </Button>
      </div>
    </div>
  );
}
