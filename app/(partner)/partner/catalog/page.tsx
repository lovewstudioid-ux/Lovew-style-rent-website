import Link from "next/link";
import Image from "next/image";
import { Construction } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { setDressStatus } from "@/app/actions/partner-catalog";

export const metadata = { title: "Katalog · Partner" };

export default async function PartnerCatalogPage() {
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

  const { data: dresses } = await supabase
    .from("dresses")
    .select(
      "id, slug, title, cover_image_url, daily_price_idr, status, rating_avg, rating_count, view_count, dress_variants(count)",
    )
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });

  const t = getDictionary(defaultLocale).partner.catalog;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-charcoal">{t.title}</h1>
        <Button asChild variant="outline">
          <Link href="/partner/catalog/new">{t.addCta}</Link>
        </Button>
      </header>

      {!dresses || dresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
          <p className="font-display text-2xl text-charcoal">{t.empty}</p>
          <Button asChild className="mt-6">
            <Link href="/partner/catalog/new">{t.addCta}</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-sm">
            <thead className="bg-soft-blush text-left text-xs uppercase tracking-widest text-charcoal/60">
              <tr>
                <th className="px-3 py-2">Dress</th>
                <th className="px-3 py-2">Harga / hari</th>
                <th className="px-3 py-2">Variant</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 bg-cream">
              {dresses.map((d) => {
                const variantCount = Array.isArray(d.dress_variants)
                  ? (d.dress_variants[0] as { count?: number })?.count ?? 0
                  : 0;
                const statusLabel =
                  d.status === "active"
                    ? t.statusActive
                    : d.status === "draft"
                      ? t.statusDraft
                      : t.statusArchived;
                return (
                  <tr key={d.id} className="hover:bg-soft-blush/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-soft-blush">
                          {d.cover_image_url ? (
                            <Image
                              src={d.cover_image_url}
                              alt={d.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <span className="text-charcoal">{d.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{formatIDR(d.daily_price_idr)}</td>
                    <td className="px-3 py-2 text-charcoal/70">{variantCount}</td>
                    <td className="px-3 py-2 text-charcoal/70">
                      {d.rating_avg
                        ? `${Number(d.rating_avg).toFixed(1)} (${d.rating_count ?? 0})`
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          d.status === "active"
                            ? "rounded-full bg-sage/10 px-2 py-0.5 text-[11px] text-sage"
                            : d.status === "draft"
                              ? "rounded-full bg-rose-gold/10 px-2 py-0.5 text-[11px] text-rose-gold"
                              : "rounded-full bg-charcoal/10 px-2 py-0.5 text-[11px] text-charcoal/60"
                        }
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <form
                        action={async (formData) => {
                          "use server";
                          await setDressStatus(formData);
                        }}
                      >
                        <input type="hidden" name="dress_id" value={d.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={d.status === "active" ? "draft" : "active"}
                        />
                        <Button type="submit" variant="ghost" size="sm">
                          {d.status === "active" ? t.toggleDraft : t.toggleActivate}
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream p-5 text-sm text-charcoal/60">
        <Construction className="mb-2 h-4 w-4" />
        Form lengkap untuk menambah/mengedit dress + variant + foto akan datang
        dalam update berikutnya. Sementara, hubungi tim LOVEW untuk menambah dress baru.
      </div>
    </div>
  );
}
