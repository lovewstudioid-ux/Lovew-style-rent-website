import Link from "next/link";
import { env } from "@/lib/env";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { DigitalsManage } from "@/components/digitals-manage";
import { isStudioAdmin } from "@/lib/spaces";
import type { DigitalProduct } from "@/lib/digitals";

export const metadata = { title: "Manage digitals · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function DigitalsManagePage() {
  if (!env.supabaseConfigured) {
    return <MagicLinkGate eyebrow="LOVEW Digitals" title="Manage your shop." blurb="Sign in to manage your templates." next="/invitations/manage" />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <MagicLinkGate eyebrow="LOVEW Digitals" title="Manage your shop." blurb="Sign in to manage your templates." next="/invitations/manage" />;
  }

  if (!isStudioAdmin(user.email)) {
    return (
      <section className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-3xl text-ink">Not authorised</p>
        <p className="mt-3 text-sm font-light text-ink/55">This area is for the LOVEW Studio team. You&apos;re signed in as {user.email}.</p>
        <Link href="/invitations" className="mt-7 inline-block text-xs uppercase tracking-[0.2em] text-wine hover:underline">← Back to Digitals</Link>
      </section>
    );
  }

  const admin = createAdminClient();
  const { data } = await admin.from("digital_products").select("*").order("created_at", { ascending: false });
  return <DigitalsManage products={(data ?? []) as DigitalProduct[]} />;
}
