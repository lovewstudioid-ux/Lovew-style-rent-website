/**
 * Style ID — analysis prompt.
 *
 * We DON'T ask the AI to paint a poster (image models reinvent the face and
 * leave it incomplete). Instead Gemini returns a structured JSON analysis of
 * the uploaded photo, and we render the result ourselves with the person's real
 * photo + colour swatches. This guarantees a correct face + complete layout.
 */

export interface StyleIdInput {
  wearsHijab: boolean;
}

/** The exact JSON the analysis must return (kept in sync with StyleAnalysis). */
export interface StyleAnalysis {
  season: string;
  undertone: string;
  contrast: string;
  vibe: string;
  summary: string;
  characteristics: string[];
  best_colors: { name: string; hex: string }[];
  avoid_colors: { name: string; hex: string }[];
  neutrals: { name: string; hex: string }[];
  metals: string[];
  makeup: { lip: string; cheek: string; eyes: string };
  hair: { colors: string[]; styles: string[]; avoid: string[] };
  hijab?: { colors: string[]; styles: string[] };
  glasses: { best: string[]; avoid: string[] };
}

export function buildAnalysisPrompt({ wearsHijab }: StyleIdInput): string {
  const hijabLine = wearsHijab
    ? `  "hijab": { "colors": [string x4], "styles": [string x3] },\n`
    : "";
  return [
    "You are a professional personal-colour and style analyst.",
    "Analyse the real person in this photo — their skin undertone, hair, eyes, and natural contrast level.",
    "Return ONLY valid minified JSON (no markdown, no commentary) with EXACTLY this shape and key order:",
    "{",
    '  "season": string,            // 12-season system, e.g. "Soft Summer", "Warm Spring"',
    '  "undertone": string,         // "Warm" | "Cool" | "Neutral"',
    '  "contrast": string,          // e.g. "Soft / low", "Medium", "High"',
    '  "vibe": string,              // short phrase, e.g. "Muted & gentle"',
    '  "summary": string,           // one warm sentence about what flatters them',
    '  "characteristics": [string x3],  // short bullets, e.g. "Cool undertone"',
    '  "best_colors": [{ "name": string, "hex": string } x8],',
    '  "avoid_colors": [{ "name": string, "hex": string } x6],',
    '  "neutrals": [{ "name": string, "hex": string } x5],',
    '  "metals": [string x1-2],     // e.g. "Silver", "White gold"',
    '  "makeup": { "lip": string, "cheek": string, "eyes": string },',
    '  "hair": { "colors": [string x4], "styles": [string x3], "avoid": [string x2] },',
    hijabLine + '  "glasses": { "best": [string x3], "avoid": [string x2] }',
    "}",
    "Use realistic hex codes that genuinely match each colour name. Keep every label short (1-3 words).",
    "Base everything specifically on THIS person — never generic. Be encouraging and precise.",
  ].join("\n");
}
