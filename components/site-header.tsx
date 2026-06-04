import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { Wordmark } from "@/components/wordmark";
import { env } from "@/lib/env";

function initialsFrom(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || (email && email.split("@")[0]) || "?";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Async server component — reads the current user from Supabase so we can
 * render either the "Masuk" button (signed out) or the avatar dropdown
 * (signed in) without flicker.
 */
export async function SiteHeader({ locale = "en" as Locale }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.nav;

  // Resolve the signed-in user when a backend is configured. Before the
  // Supabase project is wired up (or if the auth call fails), fall back to a
  // signed-out header so the marketing site still renders.
  let user: { email?: string | null } | null = null;
  let displayName: string | null = null;
  let role: string | null = null;

  if (env.supabaseConfigured) {
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .maybeSingle();
        displayName = profile?.full_name ?? null;
        role = profile?.role ?? "customer";
      }
    } catch {
      user = null;
    }
  }

  const showPartnerDashboard = role === "partner" || role === "admin";

  const navLinks = [
    { href: "/browse", label: t.browse },
    { href: "/how-it-works", label: t.howItWorks },
    { href: "/partners", label: t.partners },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-chiffon/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-editorial items-center justify-between px-6">
        <Link href="/" aria-label={`${dict.footer.parentLine}`}>
          <Wordmark className="text-ink" />
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-ink/75 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-wine"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu
              initials={initialsFrom(displayName, user.email)}
              displayName={displayName ?? user.email ?? ""}
              email={user.email ?? ""}
              t={dict.account.nav}
              showPartnerDashboard={showPartnerDashboard}
            />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-wine sm:inline-block"
              >
                {t.signIn}
              </Link>
              <Link
                href="/browse"
                className="border-b border-ink/30 pb-1 text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:border-wine hover:text-wine"
              >
                {t.browse}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
