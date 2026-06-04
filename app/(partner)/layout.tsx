import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { SignOutForm } from "@/components/sign-out-form";
import { PartnerNav } from "@/components/partner/partner-nav";

/**
 * Partner shell. Middleware already enforces role=partner|admin for /partner/*
 * (excluding /partner/onboard which any signed-in user can hit). This layout
 * adds the sidebar nav and a small "you're operating as" header.
 */
export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/partner/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "partner" && profile?.role !== "admin") redirect("/");

  // Find the partner record owned by this user (or the first one for admins).
  const { data: partner } = await supabase
    .from("partners")
    .select("id, brand_name, status")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  const t = getDictionary(defaultLocale);

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-60 border-r border-charcoal/10 bg-cream p-4 md:flex md:flex-col">
        <Link href="/partner/dashboard" className="mb-1 flex items-baseline gap-2 px-2">
          <span className="font-display text-xl font-semibold text-charcoal">LOVEW</span>
          <span className="font-display text-xl text-rose-gold">Partner</span>
        </Link>
        {partner?.brand_name ? (
          <p className="mb-6 px-2 text-xs text-charcoal/60">{partner.brand_name}</p>
        ) : (
          <p className="mb-6 px-2 text-xs text-charcoal/40">No partner profile yet</p>
        )}
        <PartnerNav t={t.partner.nav} />
        <div className="mt-auto border-t border-charcoal/10 pt-4">
          <p className="px-3 text-xs text-charcoal/50">
            {profile?.full_name ?? user.email}
          </p>
          <div className="mt-2">
            <SignOutForm label="Keluar" variant="link" />
          </div>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mb-6 flex items-center justify-between md:hidden">
          <Link href="/partner/dashboard" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold text-charcoal">LOVEW</span>
            <span className="font-display text-xl text-rose-gold">Partner</span>
          </Link>
          <SignOutForm label="Keluar" variant="button" />
        </div>
        <div className="mb-6 md:hidden">
          <PartnerNav t={t.partner.nav} />
        </div>

        {/* Suspended/Pending banner */}
        {partner && partner.status !== "active" ? (
          <div className="mb-6 rounded-md border border-rose-gold/30 bg-rose-gold/10 px-4 py-3 text-sm text-charcoal">
            Status partner kamu:{" "}
            <strong className="capitalize">{partner.status}</strong>. Beberapa
            fitur dibatasi sampai tim LOVEW menyetujui.
          </div>
        ) : null}

        {children}
      </main>
    </div>
  );
}
