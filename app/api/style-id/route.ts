import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { buildAnalysisPrompt, type StyleAnalysis } from "@/lib/style-id-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_BYTES = 8 * 1024 * 1024;

const DEMO: StyleAnalysis = {
  season: "Soft Summer",
  undertone: "Cool",
  contrast: "Soft / low",
  vibe: "Muted & gentle",
  summary: "Soft, cool, muted tones make your complexion look fresh and even.",
  characteristics: ["Cool undertone", "Soft contrast", "Muted overall"],
  best_colors: [
    { name: "Dusty Rose", hex: "#C9A0A6" }, { name: "Lavender", hex: "#B9A7C9" },
    { name: "Smoke Blue", hex: "#8FA6B8" }, { name: "Sage", hex: "#A9B89C" },
    { name: "Soft Navy", hex: "#3E4A66" }, { name: "Muted Taupe", hex: "#B6A597" },
    { name: "Mauve", hex: "#9C7E92" }, { name: "Slate", hex: "#6E7A86" },
  ],
  avoid_colors: [
    { name: "Bright Pink", hex: "#FF3DA5" }, { name: "Orange", hex: "#F2641E" },
    { name: "Lemon", hex: "#F4E04D" }, { name: "Pure White", hex: "#FFFFFF" },
    { name: "Warm Beige", hex: "#D9B486" }, { name: "True Black", hex: "#0A0A0A" },
  ],
  neutrals: [
    { name: "Soft Grey", hex: "#B9B6B6" }, { name: "Mushroom", hex: "#A99E97" },
    { name: "Cool Stone", hex: "#8C8A8E" }, { name: "Charcoal", hex: "#3F4146" },
    { name: "Ink Navy", hex: "#2A3142" },
  ],
  metals: ["Silver", "White gold"],
  makeup: { lip: "Rose / mauve", cheek: "Soft rose", eyes: "Cool taupe, soft grey" },
  hair: { colors: ["Ash brown", "Cool espresso", "Soft black", "Dark ash"], styles: ["Soft waves", "Long layers", "Face-framing"], avoid: ["Warm/brassy tones", "Heavy blunt cuts"] },
  glasses: { best: ["Soft cat-eye", "Round / oval", "Rimless"], avoid: ["Heavy black squares", "Very narrow"] },
};

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

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "Consent is required to continue." }, { status: 400 });
  if (!(selfie instanceof File)) return NextResponse.json({ error: "Please upload a selfie." }, { status: 400 });
  if (!selfie.type.startsWith("image/")) return NextResponse.json({ error: "The selfie must be an image." }, { status: 400 });
  if (selfie.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 8 MB)." }, { status: 400 });

  // Demo mode until backend keys exist — returns a sample analysis so the flow works.
  if (!env.styleIdConfigured) {
    return NextResponse.json({ status: "demo", analysis: DEMO });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();
    const bytes = Buffer.from(await selfie.arrayBuffer());

    // 1. Save the lead first.
    const { data: lead } = await supabase
      .from("style_id_leads")
      .insert({ name, email, whatsapp: whatsapp || null, wears_hijab: wearsHijab, consent, status: "pending" })
      .select("id")
      .single();
    const id = lead?.id as string | undefined;

    // 2. Store the selfie.
    if (id) {
      const selfiePath = `${id}/selfie.jpg`;
      await supabase.storage.from("style-id").upload(selfiePath, bytes, { contentType: selfie.type || "image/jpeg", upsert: true });
      await supabase.from("style_id_leads").update({ selfie_path: selfiePath }).eq("id", id);
    }

    // 3. Analyse the photo → structured JSON (Gemini vision → text, reliable).
    const prompt = buildAnalysisPrompt({ wearsHijab });
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: selfie.type || "image/jpeg", data: bytes.toString("base64") } }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      },
    );

    if (!res.ok) {
      if (id) await supabase.from("style_id_leads").update({ status: "failed" }).eq("id", id);
      return NextResponse.json({ error: "The analysis engine is busy — please try again in a moment." }, { status: 502 });
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    let analysis: StyleAnalysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Couldn't read the analysis — please try a clearer, front-facing selfie." }, { status: 502 });
    }

    if (id) await supabase.from("style_id_leads").update({ status: "done" }).eq("id", id);
    return NextResponse.json({ status: "done", analysis });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
