/**
 * Centralised access to environment variables, with friendly errors when
 * something is missing. Lazy resolution (via getters) means we don't crash at
 * module load — only when the missing value is actually used. That keeps unit
 * tests and static analysis from breaking just because a key isn't set yet.
 *
 * Read these via `env.supabaseUrl` etc., never `process.env.*` directly.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check .env.local (local) or Vercel project env vars (prod).`,
    );
  }
  return value;
}

export const env = {
  /** Public Supabase project URL. Safe to expose on the client. */
  get supabaseUrl(): string {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  /** Public Supabase anon key. Safe to expose on the client. */
  get supabaseAnonKey(): string {
    return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  /**
   * Server-only Supabase service-role key. NEVER import this from a client
   * component. Use only in server actions, route handlers, or crons.
   */
  get supabaseServiceRoleKey(): string {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  /** Canonical site URL (without trailing slash). */
  get siteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  },
  /**
   * Whether a Supabase backend is wired up. When false (e.g. previewing the
   * marketing site before the project is provisioned), the public pages still
   * render in a signed-out, no-data state instead of crashing. Never affects
   * production, where these vars are always set.
   */
  get supabaseConfigured(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
} as const;
