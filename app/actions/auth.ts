"use server";

/**
 * Auth server actions. The pages in app/(auth)/ call these from form actions.
 * Each returns either a redirect (success) or an `{ ok: false, error }` shape
 * the page renders inline.
 *
 * On sign-up we also insert a public.profiles row with role='customer' so
 * downstream RLS policies and middleware role checks work immediately.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export type AuthActionResult = { ok: false; error: string } | { ok: true; message?: string };

function safeNext(rawNext: string | null | undefined): string {
  if (!rawNext) return "/account";
  // Prevent open-redirects: only allow internal paths starting with a single /.
  if (rawNext.startsWith("/") && !rawNext.startsWith("//")) return rawNext;
  return "/account";
}

/**
 * The origin of the site the request actually came in on. Derived from request
 * headers so OAuth/email links point at the real domain even if
 * NEXT_PUBLIC_SITE_URL is unset (which would otherwise default to localhost).
 */
function siteOrigin(): string {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  } catch {
    /* headers() unavailable — fall back */
  }
  return env.siteUrl;
}

export async function signInWithPassword(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: "Email atau kata sandi salah." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithPassword(formData: FormData): Promise<AuthActionResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (!fullName) return { ok: false, error: "Nama tidak boleh kosong." };
  if (!email || !email.includes("@")) return { ok: false, error: "Format email tidak valid." };
  if (password.length < 8)
    return { ok: false, error: "Kata sandi minimal 8 karakter." };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      emailRedirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already registered") || message.includes("exists")) {
      return {
        ok: false,
        error: "Email sudah terdaftar. Coba masuk atau reset kata sandi.",
      };
    }
    return { ok: false, error: "Pendaftaran gagal. Coba lagi sebentar." };
  }

  // Insert the profile row so role + name are available immediately.
  // We use the admin client because the new user's session isn't established
  // until they confirm their email (when confirmations are on).
  if (data.user) {
    const admin = createAdminClient();
    await admin.from("profiles").upsert(
      {
        id: data.user.id,
        role: "customer",
        full_name: fullName,
        phone: phone || null,
      },
      { onConflict: "id" },
    );
  }

  // If email confirmation is required, the session isn't active yet → tell user.
  if (!data.session) {
    return {
      ok: true,
      message:
        "Cek emailmu untuk link konfirmasi. Setelah dikonfirmasi, kamu otomatis masuk.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signInWithMagicLink(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(String(formData.get("next") ?? ""));
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email." };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    const m = (error.message || "").toLowerCase();
    if (m.includes("rate") || m.includes("limit") || m.includes("too many") || m.includes("after") || m.includes("seconds")) {
      return { ok: false, error: "Too many sign-in emails just now — please wait a few minutes, then try again." };
    }
    // Surface the real reason (e.g. redirect not allowed, SMTP not configured)
    // so it can be fixed instead of hidden behind a generic message.
    return { ok: false, error: error.message || "Couldn't send the sign-in link. Please try again." };
  }
  return { ok: true, message: "Check your email for a sign-in link." };
}

export async function signInWithGoogle(formData: FormData): Promise<AuthActionResult> {
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    return { ok: false, error: "Tidak bisa lanjut dengan Google saat ini." };
  }
  redirect(data.url);
}

export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Format email tidak valid." };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/callback?next=/account`,
  });
  if (error) return { ok: false, error: "Tidak bisa kirim link reset. Coba lagi." };
  return {
    ok: true,
    message: "Link reset sudah dikirim. Cek inbox (dan folder spam) ya.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
