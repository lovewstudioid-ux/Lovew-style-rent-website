/**
 * OAuth + email-confirmation callback. Supabase redirects here after the user
 * completes:
 *   - Google OAuth
 *   - Email confirmation (sign-up)
 *   - Password-reset link
 *
 * We exchange the `code` for a session, ensure a public.profiles row exists
 * (for OAuth signups where we didn't run our sign-up server action), and then
 * forward to `?next=` or /account.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function safeNext(rawNext: string | null): string {
  if (!rawNext) return "/account";
  if (rawNext.startsWith("/") && !rawNext.startsWith("//")) return rawNext;
  return "/account";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = createClient();
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent("Sesi tidak valid. Coba lagi.")}`,
    );
  }

  // Ensure a profile row exists. For email/password sign-ups our server action
  // already inserts one; for OAuth (Google) this is the first time we see them.
  const admin = createAdminClient();
  const fullName =
    (data.user.user_metadata?.full_name as string | undefined) ??
    (data.user.user_metadata?.name as string | undefined) ??
    null;

  await admin.from("profiles").upsert(
    {
      id: data.user.id,
      role: "customer",
      full_name: fullName,
      avatar_url: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    { onConflict: "id", ignoreDuplicates: false },
  );

  return NextResponse.redirect(`${origin}${next}`);
}
