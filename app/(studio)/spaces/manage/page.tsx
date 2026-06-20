import Link from "next/link";
import { env } from "@/lib/env";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { SpacesReview } from "@/components/spaces-review";
import { isStudioAdmin, type SpaceListing } from "@/lib/spaces";

export const metadata = { title: "Review spaces · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function SpacesManagePage() {
  if (!env.supabaseConfigured) {
    return <MagicLinkGate eyebrow="LOVEW Spaces" title="Review listings." blurb="Sign in to review submitted spaces." next="/spaces/manage" />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <MagicLinkGate eyebrow="LOVEW Spaces" title="Review listings." blurb="Sign in to review submitted spaces." next="/spaces/manage" />;
  }

  if (!isStudioAdmin(user.email)) {
    return (
      <section className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-3xl text-ink">Not authorised</p>
        <p className="mt-3 text-sm font-light text-ink/55">This area is for the LOVEW Studio team. You&apos;re signed in as {user.email}.</p>
        <Link href="/spaces" className="mt-7 inline-block text-xs uppercase tracking-[0.2em] text-wine hover:underline">← Back to Spaces</Link>
      </section>
    );
  }

  const admin = createAdminClient();
  const { data } = await admin.from("space_listings").select("*").order("created_at", { ascending: false });
  return <SpacesReview listings={(data ?? []) as SpaceListing[]} />;
}
