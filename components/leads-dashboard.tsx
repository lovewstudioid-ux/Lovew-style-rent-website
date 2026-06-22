"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInquiry, deleteInquiry } from "@/app/actions/inquiries";
import { INQUIRY_STATUSES, commissionOf, type Inquiry } from "@/lib/inquiries";

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function LeadsDashboard({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const booked = inquiries.filter((i) => i.status === "booked");
  const totalDeals = booked.reduce((s, i) => s + (i.deal_value ?? 0), 0);
  const totalCommission = booked.reduce((s, i) => s + commissionOf(i), 0);

  async function save(id: string, form: HTMLFormElement) {
    const fd = new FormData(form);
    fd.set("id", id);
    await updateInquiry(fd);
    router.refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this enquiry?")) return;
    const fd = new FormData(); fd.append("id", id);
    await deleteInquiry(fd); router.refresh();
  }

  const inputCls = "w-full border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-wine";

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-12 text-center md:py-16">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW · partnerships</p>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-5xl">Leads &amp; commission</h1>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        {/* Totals */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { l: "Enquiries", v: String(inquiries.length) },
            { l: "Booked", v: String(booked.length) },
            { l: "Deal value (booked)", v: rp(totalDeals) },
            { l: "Your commission", v: rp(totalCommission) },
          ].map((c) => (
            <div key={c.l} className="border border-ink/12 bg-white p-5">
              <p className="text-[0.66rem] uppercase tracking-[0.16em] text-ink/45">{c.l}</p>
              <p className="mt-1 font-display text-2xl text-ink">{c.v}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          {["all", ...INQUIRY_STATUSES].map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)} className={`px-3.5 py-1.5 text-[0.72rem] uppercase tracking-[0.1em] transition-colors ${filter === s ? "bg-wine text-chiffon" : "border border-ink/15 text-ink/60 hover:border-wine"}`}>{s}</button>
          ))}
        </div>

        {/* Table */}
        {shown.length === 0 ? (
          <p className="mt-12 text-center font-display text-2xl text-ink/40">No enquiries yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {shown.map((i) => (
              <form
                key={i.id}
                onSubmit={(e) => { e.preventDefault(); save(i.id, e.currentTarget); }}
                className="grid items-center gap-3 border border-ink/12 bg-white p-4 md:grid-cols-[auto_1.4fr_1fr_0.8fr_0.7fr_auto]"
              >
                <div className="font-mono text-[0.7rem] uppercase tracking-wide text-wine">{i.ref_code}</div>
                <div>
                  <p className="font-display text-base text-ink">{i.listing_name}</p>
                  <p className="text-[0.72rem] text-ink/50">{i.source} · {new Date(i.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="text-sm text-ink/70">
                  <p className="text-ink">{i.customer_name}</p>
                  <p className="text-[0.72rem]">{i.customer_contact}</p>
                  {i.reported_by && <p className="text-[0.66rem] text-eucalyptus">vendor said: {i.reported_by}</p>}
                </div>
                <select name="status" defaultValue={i.status} className={inputCls}>
                  {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input name="deal_value" defaultValue={i.deal_value ?? ""} placeholder="value" className={inputCls} />
                <div className="flex items-center gap-2">
                  <input name="commission_pct" defaultValue={i.commission_pct} className="w-12 border border-ink/15 px-1.5 py-1.5 text-center text-sm outline-none focus:border-wine" title="commission %" />
                  <span className="text-[0.66rem] text-ink/40">%</span>
                  <button type="submit" className="bg-ink px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.12em] text-white hover:bg-wine">Save</button>
                  <button type="button" onClick={() => remove(i.id)} className="text-ink/30 hover:text-wine" aria-label="Delete">✕</button>
                </div>
              </form>
            ))}
          </div>
        )}

        <p className="mt-8 text-[0.72rem] font-light leading-relaxed text-ink/45">
          Tip: vendors can self-report a deal at <span className="font-mono">lovew.studio/report/[ref]</span> — or update status here after your monthly reconciliation. Commission totals count only <b>booked</b> rows.
        </p>
      </section>
    </>
  );
}
