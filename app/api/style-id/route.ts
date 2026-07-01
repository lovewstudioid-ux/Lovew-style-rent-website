import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { buildAnalysisPrompt, type StyleAnalysis } from "@/lib/style-id-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  const wearsHijab = String(form.get("wearsHijab")) === "true";
  const consent = String(form.get("consent")) === "true";
  const selfie = form.get("selfie");
  const fullbody = form.get("fullbody");

  if (!consent) return NextResponse.json({ error: "Consent is required to continue." }, { status: 400 });
  if (!(selfie instanceof File)) return NextResponse.json({ error: "Please upload a selfie." }, { status: 400 });
  if (!selfie.type.startsWith("image/")) return NextResponse.json({ error: "The selfie must be an image." }, { status: 400 });
  if (selfie.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 8 MB)." }, { status: 400 });

  // Demo mode until backend keys exist — returns a sample analysis so the flow works.
  if (!env.styleIdConfigured) {
    return NextResponse.json({ status: "demo", analysis: DEMO });
  }

  try {
    const { createClient, createAdminClient } = await import("@/lib/supabase/server");
    // Identity comes from the signed-in account — never from the form.
    const userClient = createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    const { data: profile } = await userClient.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
    const name = (profile?.full_name as string) || user.email || "Customer";
    const email = user.email ?? "";
    const whatsapp = (profile?.phone as string) || null;

    const supabase = createAdminClient();
    const bytes = Buffer.from(await selfie.arrayBuffer());

    // 1. Save the lead first.
    const { data: lead } = await supabase
      .from("style_id_leads")
      .insert({ name, email, whatsapp, wears_hijab: wearsHijab, consent, status: "pending" })
      .select("id")
      .single();
    const id = lead?.id as string | undefined;

    // 2. Store the selfie.
    if (id) {
      const selfiePath = `${id}/selfie.jpg`;
      await supabase.storage.from("style-id").upload(selfiePath, bytes, { contentType: selfie.type || "image/jpeg", upsert: true });
      await supabase.from("style_id_leads").update({ selfie_path: selfiePath }).eq("id", id);
    }

    // 3. Analyse the photo(s) → structured JSON (Gemini vision → text, reliable).
    const prompt = buildAnalysisPrompt({ wearsHijab });
    const parts: Array<Record<string, unknown>> = [
      { text: prompt },
      { inline_data: { mime_type: selfie.type || "image/jpeg", data: bytes.toString("base64") } },
    ];
    if (fullbody instanceof File && fullbody.size > 0 && fullbody.size <= MAX_BYTES && fullbody.type.startsWith("image/")) {
      const fb = Buffer.from(await fullbody.arrayBuffer());
      parts.push({ text: "An optional full-body photo of the same person for additional context:" });
      parts.push({ inline_data: { mime_type: fullbody.type, data: fb.toString("base64") } });
    }
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
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

    // Auto-save result so it persists for the user
    const slug = Math.random().toString(36).slice(2, 10);
    let resultPhotoUrl: string | null = null;
    const ext = selfie.type.includes("png") ? "png" : "jpg";
    const up = await supabase.storage.from("style-id-public").upload(`${slug}.${ext}`, bytes, { contentType: selfie.type || "image/jpeg", upsert: true });
    if (!up.error) resultPhotoUrl = supabase.storage.from("style-id-public").getPublicUrl(`${slug}.${ext}`).data.publicUrl;
    await supabase.from("style_id_results").insert({ slug, name, analysis, photo_url: resultPhotoUrl, user_id: user.id });

    return NextResponse.json({ status: "done", analysis, slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
