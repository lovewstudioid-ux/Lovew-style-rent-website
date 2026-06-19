import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { buildPrompt } from "@/lib/style-id-prompts";

export const runtime = "nodejs";
// Never statically cache this route — env checks must reflect true runtime.
export const dynamic = "force-dynamic";
// Image generation can take 20-40s — give the route room.
export const maxDuration = 60;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Diagnostic — reports which env vars the server can see (booleans only, never
 * the values). Lets us confirm the Style ID backend is wired without exposing
 * any secret. Safe to leave in; reveals nothing sensitive.
 */
export async function GET() {
  return NextResponse.json({
    configured: env.styleIdConfigured,
    present: {
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  });
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const wearsHijab = String(form.get("wearsHijab")) === "true";
  const consent = String(form.get("consent")) === "true";
  const selfie = form.get("selfie");

  // --- Validation -----------------------------------------------------------
  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "Consent is required to continue." }, { status: 400 });
  if (!(selfie instanceof File)) return NextResponse.json({ error: "Please upload a selfie." }, { status: 400 });
  if (!selfie.type.startsWith("image/")) return NextResponse.json({ error: "The selfie must be an image." }, { status: 400 });
  if (selfie.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 8 MB)." }, { status: 400 });

  // --- Demo mode (no keys yet) ---------------------------------------------
  // Lets the whole page flow be exercised before the backend is provisioned.
  if (!env.styleIdConfigured) {
    return NextResponse.json({ status: "demo" });
  }

  // --- Live flow ------------------------------------------------------------
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const bytes = Buffer.from(await selfie.arrayBuffer());

    // 1. Save the lead FIRST so a failed generation never loses the contact.
    const { data: lead, error: insErr } = await supabase
      .from("style_id_leads")
      .insert({
        name,
        email,
        whatsapp: whatsapp || null,
        wears_hijab: wearsHijab,
        consent,
        status: "pending",
      })
      .select("id")
      .single();
    if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);
    const id = lead.id as string;

    // 2. Store the selfie.
    const selfiePath = `${id}/selfie.jpg`;
    const up = await supabase.storage
      .from("style-id")
      .upload(selfiePath, bytes, { contentType: selfie.type || "image/jpeg", upsert: true });
    if (up.error) throw new Error(`Selfie upload failed: ${up.error.message}`);
    await supabase.from("style_id_leads").update({ selfie_path: selfiePath }).eq("id", id);

    // 3. Generate the poster with Gemini 2.5 Flash Image.
    const prompt = buildPrompt({ wearsHijab });
    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${env.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: selfie.type || "image/jpeg", data: bytes.toString("base64") } },
              ],
            },
          ],
        }),
      },
    );

    if (!gemRes.ok) {
      const t = await gemRes.text();
      await supabase.from("style_id_leads").update({ status: "failed", error: t.slice(0, 400) }).eq("id", id);
      throw new Error("The analysis engine is busy — please try again in a moment.");
    }

    const gem = await gemRes.json();
    const parts: Array<Record<string, any>> = gem?.candidates?.[0]?.content?.parts ?? [];
    const inline = parts.map((p) => p.inline_data ?? p.inlineData).find((d) => d?.data);
    if (!inline?.data) {
      await supabase.from("style_id_leads").update({ status: "failed", error: "no image returned" }).eq("id", id);
      throw new Error("No analysis image was returned — please try a clearer, front-facing selfie.");
    }

    const mime: string = inline.mime_type ?? inline.mimeType ?? "image/png";
    const ext = mime.includes("png") ? "png" : "jpg";
    const resultBuf = Buffer.from(inline.data, "base64");

    // 4. Store the result + mark done.
    const resultPath = `${id}/result.${ext}`;
    await supabase.storage.from("style-id").upload(resultPath, resultBuf, { contentType: mime, upsert: true });
    await supabase.from("style_id_leads").update({ status: "done", result_path: resultPath }).eq("id", id);

    // Return the poster inline so the page can show + download it immediately.
    return NextResponse.json({ status: "done", resultUrl: `data:${mime};base64,${inline.data}` });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
