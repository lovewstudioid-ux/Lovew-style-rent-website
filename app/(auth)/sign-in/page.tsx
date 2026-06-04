import Link from "next/link";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPassword, signInWithGoogle } from "@/app/actions/auth";

export const metadata = { title: "Masuk" };

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const t = getDictionary(defaultLocale).auth;
  const next = searchParams.next ?? "/account";
  const error = searchParams.error;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-charcoal">
        {t.signIn.title}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70">{t.signIn.subtitle}</p>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          const res = await signInWithPassword(formData);
          if (!res.ok) {
            const { redirect: nextRedirect } = await import("next/navigation");
            const params = new URLSearchParams({
              next,
              error: res.error,
            });
            nextRedirect(`/sign-in?${params.toString()}`);
          }
        }}
        className="mt-8 space-y-4"
      >
        <input type="hidden" name="next" value={next} />

        <div className="space-y-2">
          <Label htmlFor="email">{t.signIn.emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="kamu@email.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.signIn.passwordLabel}</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-rose-gold hover:underline"
            >
              {t.signIn.forgot}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          {t.signIn.submit}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-charcoal/10" />
        <span className="text-xs uppercase tracking-widest text-charcoal/50">
          atau
        </span>
        <div className="h-px flex-1 bg-charcoal/10" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="outline" size="lg" className="w-full">
          {t.signIn.google}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal/70">
        {t.signIn.noAccount}{" "}
        <Link
          href={`/sign-up${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-rose-gold hover:underline"
        >
          {t.signIn.signUpLink}
        </Link>
      </p>
    </div>
  );
}
