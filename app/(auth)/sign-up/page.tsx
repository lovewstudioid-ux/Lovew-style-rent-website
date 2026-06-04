import Link from "next/link";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithPassword, signInWithGoogle } from "@/app/actions/auth";

export const metadata = { title: "Daftar" };

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string; message?: string };
}) {
  const t = getDictionary(defaultLocale).auth;
  const next = searchParams.next ?? "/account";
  const error = searchParams.error;
  const message = searchParams.message;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-charcoal">
        {t.signUp.title}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70">{t.signUp.subtitle}</p>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="mt-6 rounded-md border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-charcoal"
        >
          {message}
        </div>
      ) : null}

      <form
        action={async (formData) => {
          "use server";
          const res = await signUpWithPassword(formData);
          const { redirect: nextRedirect } = await import("next/navigation");
          if (!res.ok) {
            const params = new URLSearchParams({ next, error: res.error });
            nextRedirect(`/sign-up?${params.toString()}`);
          }
          if (res.ok && res.message) {
            const params = new URLSearchParams({ next, message: res.message });
            nextRedirect(`/sign-up?${params.toString()}`);
          }
        }}
        className="mt-8 space-y-4"
      >
        <input type="hidden" name="next" value={next} />

        <div className="space-y-2">
          <Label htmlFor="full_name">{t.signUp.nameLabel}</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.signUp.emailLabel}</Label>
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
          <Label htmlFor="phone">{t.signUp.phoneLabel}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="0812xxxxxxxx"
          />
          <p className="text-xs text-charcoal/50">{t.signUp.phoneHint}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.signUp.passwordLabel}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-charcoal/50">{t.signUp.passwordHint}</p>
        </div>

        <Button type="submit" size="lg" className="w-full">
          {t.signUp.submit}
        </Button>

        <p className="text-xs leading-relaxed text-charcoal/50">{t.legalNote}</p>
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
          {t.signUp.google}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal/70">
        {t.signUp.haveAccount}{" "}
        <Link
          href={`/sign-in${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-rose-gold hover:underline"
        >
          {t.signUp.signInLink}
        </Link>
      </p>
    </div>
  );
}
