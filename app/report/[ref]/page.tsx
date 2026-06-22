import { notFound } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import { ReportForm } from "@/components/report-form";

export const metadata = { title: "Report a deal · LOVEW" };
export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: { ref: string } }) {
  if (!env.supabaseConfigured) notFound();

  const admin = createAdminClient();
  const { data } = await admin
    .from("inquiries")
    .select("ref_code, listing_name, customer_name, status, reported_by")
    .eq("ref_code", params.ref)
    .single();
  if (!data) notFound();

  const inq = data as { ref_code: string; listing_name: string; customer_name: string; status: string; reported_by: string | null };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-editorial items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-lg tracking-wide text-ink">LOVEW <span className="text-wine">STUDIO</span></Link>
          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-ink/40">Provider report</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-wine">Ref {inq.ref_code}</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-ink">{inq.listing_name}</h1>
        <p className="mt-2 text-sm font-light text-ink/60">Enquiry from <b>{inq.customer_name}</b> via LOVEW.</p>
        {inq.status === "booked" ? (
          <div className="mt-8 border border-eucalyptus/40 bg-[#f3f6f2] px-5 py-6 text-center">
            <p className="font-display text-lg text-ink">Already marked as booked ✓</p>
            <p className="mt-1 text-sm font-light text-ink/60">Thanks{inq.reported_by ? `, ${inq.reported_by}` : ""} — LOVEW has recorded this.</p>
          </div>
        ) : (
          <ReportForm refCode={inq.ref_code} />
        )}
      </main>
    </div>
  );
}
