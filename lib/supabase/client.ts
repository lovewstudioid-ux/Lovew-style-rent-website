/**
 * Supabase client for BROWSER contexts — "use client" components and any code
 * that runs in the browser bundle. Reads the auth session from the cookies
 * that the server set during SSR.
 *
 * Do NOT import this from a server component. Use `lib/supabase/server.ts`
 * for server code.
 */

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
