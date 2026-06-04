/**
 * Session-refresh middleware helper. Called from the root middleware.ts on
 * every request that matches the matcher. Ensures the access token is fresh
 * and the auth cookies are passed through correctly to both the request (for
 * downstream server code) and the response (for the browser).
 *
 * Role-based route protection (e.g. /admin requires role='admin') is layered
 * on top of this — see the matcher and route-guard logic in the calling
 * middleware.ts.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: getUser() must be called here. It revalidates the session with
  // the auth server and refreshes the access token if needed. Skipping this
  // breaks long-lived sessions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, supabase, user };
}
