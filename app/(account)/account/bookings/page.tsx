import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatDate, formatIDR } from "@/lib/format";
import { StatusPill, DepositPill } from "@/components/booking/status-pill";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Booking" };

const ACTIVE = new Set(["pending_payment", "confirmed", "in_use", "returned", "disputed"]);

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/bookings");

  const tab = searchParams.tab === "completed" ? "completed" : "active";

  const { data: rows } = await supabase
    .from("bookings")
    .select(
      `
      id, booking_code, status, deposit_status,
      start_date, end_date, rental_days, total_idr,
      dresses ( title, slug, cover_image_url, partners ( slug, brand_name ) )
    `,
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const filtered = (rows ?? []).filter((r) =>
    tab === "active" ? ACTIVE.has(r.status) : !ACTIVE.has(r.status),
  );

  const t = getDictionary(defaultLocale).bookings;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">{t.title}</h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-soft-blush p-1">
        <TabLink href="/account/bookings" active={tab === "active"}>
          {t.tabActive}
        </TabLink>
        <TabLink href="/account/bookings?tab=completed" active={tab === "completed"}>
          {t.tabCompleted}
        </TabLink>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-charcoal/30" />
          <p className="mt-3 font-display text-2xl text-charcoal">{t.empty}</p>
          <Button asChild className="mt-6">
            <Link href="/browse">Jelajahi koleksi</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => {
            const dress = Array.isArray(row.dresses) ? row.dresses[0] : row.dresses;
            const partner = dress
              ? Array.isArray(dress.partners)
                ? dress.partners[0]
                : dress.partners
              : null;
            return (
              <li key={row.id}>
                <Link
                  href={`/account/bookings/${row.id}`}
                  className="flex items-start gap-4 rounded-2xl border border-charcoal/10 bg-cream p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-soft-blush">
                    {dress?.cover_image_url ? (
                      <Image
                        src={dress.cover_image_url}
                        alt={dress.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={row.status} t={t.status} />
                      <DepositPill status={row.deposit_status} t={t.deposit} />
                    </div>
                    <p className="mt-2 font-display text-lg leading-snug text-charcoal">
                      {dress?.title ?? "—"}
                    </p>
                    <p className="text-xs text-charcoal/60">
                      {partner?.brand_name} · <span className="font-mono">{row.booking_code}</span>
                    </p>
                    <p className="mt-1 text-xs text-charcoal/60">
                      {formatDate(row.start_date)} – {formatDate(row.end_date)} ({row.rental_days} hari)
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p className="font-medium text-charcoal">{formatIDR(row.total_idr)}</p>
                    <p className="mt-1 text-xs text-rose-gold">{t.detailCta} →</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-lg bg-cream px-4 py-2 text-sm font-medium text-rose-gold shadow-sm"
          : "rounded-lg px-4 py-2 text-sm text-charcoal/70 hover:text-charcoal"
      }
    >
      {children}
    </Link>
  );
}
