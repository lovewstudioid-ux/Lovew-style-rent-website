import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export const metadata = { title: "Profil" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, city")
    .eq("id", user.id)
    .maybeSingle();

  const t = getDictionary(defaultLocale).account.profile;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-charcoal">
        {t.title}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70">{t.subtitle}</p>

      {searchParams.saved ? (
        <div
          role="status"
          className="mt-6 rounded-md border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-charcoal"
        >
          {t.saved}
        </div>
      ) : null}
      {searchParams.error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {searchParams.error}
        </div>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          const res = await updateProfile(formData);
          const { redirect: nextRedirect } = await import("next/navigation");
          if (!res.ok) {
            nextRedirect(`/account?error=${encodeURIComponent(res.error ?? "Gagal.")}`);
          }
          nextRedirect("/account?saved=1");
        }}
        className="mt-8 max-w-md space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user.email ?? ""} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">{t.nameLabel}</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={profile?.full_name ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.phoneLabel}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            defaultValue={profile?.phone ?? ""}
            placeholder="0812xxxxxxxx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">{t.cityLabel}</Label>
          <select
            id="city"
            name="city"
            defaultValue={profile?.city ?? ""}
            className="flex h-11 w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <option value="">{t.cityPlaceholder}</option>
            {brand.cities.map((c) => (
              <option key={c} value={c.toLowerCase()}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="lg">
          {t.save}
        </Button>
      </form>
    </div>
  );
}
