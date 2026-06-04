import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AccountNav } from "@/components/account/account-nav";

/**
 * Shared layout for /account/*. Wraps pages with site header + footer and a
 * sidebar nav. Auth is enforced by middleware.ts — we just need the role here
 * to decide whether to show the "Dashboard Partner" link.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt and suspenders — middleware should have caught this already.
  if (!user) redirect("/sign-in?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const t = getDictionary(defaultLocale);
  const isPartner = profile?.role === "partner" || profile?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={defaultLocale} />

      <main className="flex-1 bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[260px_1fr]">
          <aside>
            <p className="mb-6 text-xs uppercase tracking-widest text-charcoal/50">
              {profile?.full_name ?? user.email}
            </p>
            <AccountNav t={t.account.nav} showPartnerDashboard={isPartner} />
          </aside>

          <section>{children}</section>
        </div>
      </main>

      <SiteFooter locale={defaultLocale} />
    </div>
  );
}
