/**
 * Supabase client for SERVER contexts — server components, server actions,
 * route handlers, and crons. Reads the auth session from cookies via
 * `next/headers`.
 *
 * Do NOT import this from a client component. Use `lib/supabase/client.ts`
 * for browser code.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Server client scoped to the current request. The `cookies()` call binds the
 * client to this request's auth session, so any query you make respects RLS
 * as the logged-in user (or anon if signed out).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll throws when called from a server component (read-only
          // cookies). That's fine — middleware will refresh the session on
          // the next request.
        }
      },
    },
  });
}

/**
 * Admin client that uses the SERVICE-ROLE key. Bypasses RLS — use sparingly,
 * only for trusted server-side work like:
 *   - the deposit ledger (lib/deposit.ts)
 *   - admin-only mutations
 *   - cron jobs (auto-cancel, refunds, payouts)
 *
 * Never expose this client to user-controlled input without re-checking
 * authorisation yourself.
 */
export function createAdminClient() {
  return createServerClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    cookies: {
      // Admin client doesn't use cookies — pass a no-op store.
      getAll() {
        return [];
      },
      setAll() {
        /* no-op */
      },
    },
  });
}
