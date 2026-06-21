import Link from "next/link";
import { env } from "@/lib/env";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MagicLinkGate } from "@/components/magic-link-gate";
import { FashionReview } from "@/components/fashion-review";
import { isStudioAdmin } from "@/lib/spaces";
import type { FashionListing } from "@/lib/fashion";

export const metadata = { title: "Review fashion · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function FashionManagePage() {
  if (!env.supabaseConfigured) {
    return <MagicLinkGate eyebrow="LOVEW Fashion" title="Review listings." blurb="Sign in to review submitted pieces." next="/fashion/manage" />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <MagicLinkGate eyebrow="LOVEW Fashion" title="Review listings." blurb="Sign in to review submitted pieces." next="/fashion/manage" />;
  }

  if (!isStudioAdmin(user.email)) {
    return (
      <section className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="font-display text-3xl text-ink">Not authorised</p>
        <p className="mt-3 text-sm font-light text-ink/55">This area is for the LOVEW Studio team. You&apos;re signed in as {user.email}.</p>
        <Link href="/fashion" className="mt-7 inline-block text-xs uppercase tracking-[0.2em] text-wine hover:underline">← Back to Fashion</Link>
      </section>
    );
  }

  const admin = createAdminClient();
  const { data } = await admin.from("fashion_listings").select("*").order("created_at", { ascending: false });
  return <FashionReview listings={(data ?? []) as FashionListing[]} />;
}
