/**
 * Root middleware. Runs on every matching request to:
 *   1. Refresh the Supabase auth session (cookies + access token).
 *   2. Protect role-gated routes:
 *        /account/*   → any signed-in user
 *        /partner/*   → role 'partner' or 'admin' (except /partner which is
 *                       the public sales/landing page and /partner/onboard
 *                       which any signed-in user can reach)
 *        /admin/*     → role 'admin' only
 *
 * If a guard fails, we redirect to /sign-in with a `next` param so the user
 * lands back where they tried to go after signing in.
 */

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { env } from "@/lib/env";

const ACCOUNT_PREFIX = "/account";
const PARTNER_AREA_PREFIX = "/partner/";
const ADMIN_PREFIX = "/admin";

// The public "become a partner" landing page lives at /partner (no trailing slash).
// /partner/onboard is reachable by any signed-in customer (they upgrade their role on submit).
function isPartnerAreaPath(path: string): boolean {
  return path.startsWith(PARTNER_AREA_PREFIX) && !path.startsWith("/partner/onboard");
}

function redirectToSignIn(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  const next = encodeURIComponent(url.pathname + url.search);
  url.pathname = "/sign-in";
  url.search = `?next=${next}`;
  return NextResponse.redirect(url);
}

function redirectHome(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  // Before a Supabase project is wired up, skip auth refresh + route guards so
  // the public marketing site renders. Production always has these vars set.
  if (!env.supabaseConfigured) {
    return NextResponse.next();
  }

  const { supabaseResponse, supabase, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const needsAuth =
    path.startsWith(ACCOUNT_PREFIX) ||
    isPartnerAreaPath(path) ||
    path.startsWith(ADMIN_PREFIX) ||
    path === "/partner/onboard" ||
    path === "/checkout";

  if (!needsAuth) {
    return supabaseResponse;
  }

  if (!user) {
    return redirectToSignIn(request);
  }

  // For role-gated routes, fetch the profile role once.
  const roleGated =
    isPartnerAreaPath(path) || path.startsWith(ADMIN_PREFIX);

  if (roleGated) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "customer";

    if (path.startsWith(ADMIN_PREFIX) && role !== "admin") {
      return redirectHome(request);
    }
    if (
      isPartnerAreaPath(path) &&
      role !== "partner" &&
      role !== "admin"
    ) {
      return redirectHome(request);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
