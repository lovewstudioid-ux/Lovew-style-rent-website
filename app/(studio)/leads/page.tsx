import Link from "next/link";
import { env } from "@/lib/env";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { LeadsDashboard } from "@/components/leads-dashboard";
import { isStudioAdmin } from "@/lib/spaces";
import type { Inquiry } from "@/lib/inquiries";

export const metadata = { title: "Leads & commission · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  if (!env.supabaseConfigured) {
    return <MagicLinkGate eyebrow="LOVEW · partnerships" title="Leads & commission." blurb="Sign in to see enquiries and commission." next="/leads" />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <MagicLinkGate eyebrow="LOVEW · partnerships" title="Leads & commission." blurb="Sign in to see enquiries and commission." next="/leads" />;
  }

  if (!isStudioAdmin(user.email)) {
    return (
      <section className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-3xl text-ink">Not authorised</p>
        <p className="mt-3 text-sm font-light text-ink/55">This area is for the LOVEW Studio team. You&apos;re signed in as {user.email}.</p>
        <Link href="/" className="mt-7 inline-block text-xs uppercase tracking-[0.2em] text-wine hover:underline">← Home</Link>
      </section>
    );
  }

  const admin = createAdminClient();
  const { data } = await admin.from("inquiries").select("*").order("created_at", { ascending: false });
  return <LeadsDashboard inquiries={(data ?? []) as Inquiry[]} />;
}
