import Link from "next/link";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/app/actions/auth";

export const metadata = { title: "Lupa kata sandi" };

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const t = getDictionary(defaultLocale).auth;
  const error = searchParams.error;
  const message = searchParams.message;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-charcoal">
        {t.forgot.title}
      </h1>
      <p className="mt-2 text-sm text-charcoal/70">{t.forgot.subtitle}</p>

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
          const res = await requestPasswordReset(formData);
          const { redirect: nextRedirect } = await import("next/navigation");
          if (!res.ok) {
            nextRedirect(`/forgot-password?error=${encodeURIComponent(res.error)}`);
          }
          nextRedirect(
            `/forgot-password?message=${encodeURIComponent(res.message ?? t.forgot.sent)}`,
          );
        }}
        className="mt-8 space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t.forgot.emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="kamu@email.com"
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          {t.forgot.submit}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm">
        <Link href="/sign-in" className="text-rose-gold hover:underline">
          ← {t.forgot.back}
        </Link>
      </p>
    </div>
  );
}
