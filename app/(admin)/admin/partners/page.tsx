import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setPartnerStatus, setPartnerCommission } from "@/app/actions/partners";

export const metadata = { title: "Partner · Admin" };

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "pending";
  const supabase = createClient();
  const { data: partners } = await supabase
    .from("partners")
    .select(
      "id, brand_name, slug, city, status, commission_pct, instagram, rating_avg, rating_count, created_at, owner_user_id",
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">Partner</h1>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const active = (searchParams.status ?? "pending") === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/partners?status=${tab.value}`}
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

      {!partners || partners.length === 0 ? (
        <p className="text-sm text-charcoal/60">Tidak ada partner di status ini.</p>
      ) : (
        <ul className="space-y-3">
          {partners.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-charcoal/10 bg-cream p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-xl text-charcoal">{p.brand_name}</p>
                  <p className="text-xs text-charcoal/60">
                    {p.city} ·{" "}
                    {p.instagram ? (
                      <a
                        href={p.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-rose-gold"
                      >
                        IG
                      </a>
                    ) : (
                      "—"
                    )}{" "}
                    ·{" "}
                    <Link
                      href={`/p/${p.slug}`}
                      target="_blank"
                      className="hover:text-rose-gold"
                    >
                      Lihat storefront
                    </Link>
                  </p>
                  <p className="mt-1 text-xs text-charcoal/50">
                    Rating: {p.rating_avg ? Number(p.rating_avg).toFixed(1) : "—"} (
                    {p.rating_count ?? 0})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Commission inline edit */}
                  <form
                    action={async (formData) => {
                      "use server";
                      await setPartnerCommission(formData);
                    }}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="partner_id" value={p.id} />
                    <Input
                      type="number"
                      name="commission_pct"
                      defaultValue={p.commission_pct}
                      step="0.5"
                      min="0"
                      max="50"
                      className="h-9 w-20"
                    />
                    <span className="text-xs text-charcoal/60">%</span>
                    <Button type="submit" size="sm" variant="outline">
                      Simpan
                    </Button>
                  </form>

                  {/* Status actions */}
                  {p.status !== "active" ? (
                    <form
                      action={async (formData) => {
                        "use server";
                        await setPartnerStatus(formData);
                      }}
                    >
                      <input type="hidden" name="partner_id" value={p.id} />
                      <input type="hidden" name="status" value="active" />
                      <Button type="submit" size="sm">
                        Setujui
                      </Button>
                    </form>
                  ) : null}
                  {p.status !== "suspended" ? (
                    <form
                      action={async (formData) => {
                        "use server";
                        await setPartnerStatus(formData);
                      }}
                    >
                      <input type="hidden" name="partner_id" value={p.id} />
                      <input type="hidden" name="status" value="suspended" />
                      <Button type="submit" size="sm" variant="ghost">
                        Suspend
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
