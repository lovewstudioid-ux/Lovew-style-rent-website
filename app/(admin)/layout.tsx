import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutForm } from "@/components/sign-out-form";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Admin shell — sidebar nav, brand wordmark, sign-out. Middleware enforces
 * the role check at the edge; this is a belt-and-suspenders re-check that
 * also fetches the admin's name for the header.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-60 border-r border-charcoal/10 bg-cream p-4 md:flex md:flex-col">
        <Link href="/admin" className="mb-6 flex items-baseline gap-2 px-2">
          <span className="font-display text-xl font-semibold text-charcoal">LOVEW</span>
          <span className="font-display text-xl text-rose-gold">Admin</span>
        </Link>
        <AdminNav />
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
        {/* Mobile top bar with admin links */}
        <div className="mb-6 flex items-center justify-between md:hidden">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold text-charcoal">LOVEW</span>
            <span className="font-display text-xl text-rose-gold">Admin</span>
          </Link>
          <SignOutForm label="Keluar" variant="button" />
        </div>
        <div className="mb-6 md:hidden">
          <AdminNav />
        </div>

        {children}
      </main>
    </div>
  );
}
