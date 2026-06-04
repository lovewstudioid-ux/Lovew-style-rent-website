import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveDamageClaim } from "@/app/actions/admin-deposits";

export const metadata = { title: "Sengketa · Admin" };

export default async function AdminDisputesPage() {
  const supabase = createClient();
  const { data: claims } = await supabase
    .from("damage_claims")
    .select(
      `
      id, status, claimed_idr, reason, description, created_at,
      booking_id,
      partners ( brand_name ),
      profiles!damage_claims_customer_id_fkey ( full_name )
    `,
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          Sengketa terbuka
        </h1>
        <p className="mt-1 text-sm text-charcoal/70">
          Klaim partner terhadap deposit. Tinjau bukti dan tentukan jumlah yang
          disetujui.
        </p>
      </header>

      {!claims || claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/20 bg-cream px-6 py-16 text-center">
          <AlertOctagon className="mx-auto h-10 w-10 text-charcoal/30" />
          <p className="mt-3 font-display text-2xl text-charcoal">
            Tidak ada sengketa terbuka
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {claims.map((c) => {
            const partner = Array.isArray(c.partners) ? c.partners[0] : c.partners;
            const customer = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
            return (
              <li
                key={c.id}
                className="rounded-2xl border border-charcoal/10 bg-cream p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg text-charcoal capitalize">
                      {c.reason} — {formatIDR(c.claimed_idr)}
                    </p>
                    <p className="text-xs text-charcoal/60">
                      {partner?.brand_name} · vs {customer?.full_name ?? "—"} ·{" "}
                      {formatDate(c.created_at)}
                    </p>
                    {c.description ? (
                      <p className="mt-2 text-sm text-charcoal/80">{c.description}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/admin/bookings/${c.booking_id}`}
                    className="rounded-md border border-charcoal/15 px-3 py-1.5 text-xs hover:bg-soft-blush"
                  >
                    Buka booking →
                  </Link>
                </div>

                {/* Approve / Reject form */}
                <div className="mt-4 grid gap-3 rounded-lg bg-soft-blush/40 p-4 md:grid-cols-[1fr_auto_auto]">
                  <form
                    action={async (formData) => {
                      "use server";
                      await resolveDamageClaim(formData);
                    }}
                    className="contents"
                  >
                    <input type="hidden" name="claim_id" value={c.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <div className="flex flex-col gap-2 md:flex-row md:items-end">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`approved_${c.id}`}>Jumlah disetujui (Rp)</Label>
                        <Input
                          id={`approved_${c.id}`}
                          name="approved_idr"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max={c.claimed_idr}
                          defaultValue={c.claimed_idr}
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`note_${c.id}`}>Catatan</Label>
                        <Input
                          id={`note_${c.id}`}
                          name="resolution_note"
                          type="text"
                          placeholder="Opsional"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="md:self-end">
                      Setujui
                    </Button>
                  </form>

                  <form
                    action={async (formData) => {
                      "use server";
                      await resolveDamageClaim(formData);
                    }}
                  >
                    <input type="hidden" name="claim_id" value={c.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <Button type="submit" size="sm" variant="ghost" className="md:self-end">
                      Tolak
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-charcoal/50">
        Menyetujui klaim akan membayar jumlah disetujui ke partner dari deposit
        + me-refund sisanya ke customer. Menolak akan me-refund seluruh deposit
        ke customer. Tindakan ditulis ke deposit_ledger dan tidak bisa
        di-undo otomatis.
      </p>
    </div>
  );
}
