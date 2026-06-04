import Link from "next/link";

/**
 * Shared layout for /sign-in, /sign-up, /forgot-password. Centered card on a
 * cream background with a serif brand wordmark linking home. No top nav — auth
 * pages are deliberately focused.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-charcoal">
            LOVEW
          </span>
          <span className="font-display text-2xl font-medium text-rose-gold">
            Style
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-16 pt-4 md:items-center md:pt-0">
        <div className="w-full max-w-md rounded-2xl border border-charcoal/10 bg-cream p-8 shadow-sm md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
