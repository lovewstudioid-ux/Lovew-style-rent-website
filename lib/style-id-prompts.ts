/**
 * Style ID — colour-analysis prompt for Gemini Vision.
 *
 * We do NOT ask Gemini to paint a poster (image models re-invent the face and
 * leave it incomplete). Instead Gemini returns a structured JSON analysis of
 * the uploaded photo, and we render the result ourselves with the person's real
 * photo + colour swatches. This guarantees a correct face + complete layout.
 */

export interface StyleIdInput {
  wearsHijab: boolean;
}

/** The exact JSON shape Gemini must return (kept in sync with StyleAnalysis). */
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
    ? `  "hijab": { "colors": [4 color names], "styles": [3 style names] },\n`
    : "";

  return [
    "You are a certified 12-season personal colour analyst and professional stylist.",
    "",
    "Follow these exact steps to analyse the REAL person in this photo:",
    "",
    "STEP 1 — UNDERTONE (from skin in natural light):",
    "  • Warm: yellow/golden/peachy/olive tones, veins look greenish",
    "  • Cool: pink/rosy/bluish tones, veins look blue/purple",
    "  • Neutral-Warm: slight warmth, blue-green veins",
    "  • Neutral-Cool: slight coolness, balanced veins",
    "",
    "STEP 2 — VALUE (depth of colouring):",
    "  • Light: fair/pale skin, light hair, light eyes",
    "  • Medium: medium skin, medium-brown hair",
    "  • Deep: dark skin, dark hair, dark eyes",
    "",
    "STEP 3 — CHROMA (clarity of colouring):",
    "  • Clear/Bright: vivid, high-contrast features",
    "  • Soft/Muted: blended, low-saturation colouring",
    "",
    "STEP 4 — CONTRAST (difference between hair, skin, eyes):",
    "  • Low: features blend into each other",
    "  • Medium: moderate difference",
    "  • High: strong sharp difference between features",
    "",
    "STEP 5 — MAP TO 12-SEASON SYSTEM:",
    "  Springs (warm+clear): True Spring, Light Spring, Bright Spring",
    "  Summers (cool+soft): True Summer, Light Summer, Soft Summer",
    "  Autumns (warm+soft): True Autumn, Soft Autumn, Dark Autumn",
    "  Winters (cool+clear): True Winter, Bright Winter, Dark Winter",
    "",
    "Return ONLY valid minified JSON — no markdown, no commentary, no trailing commas.",
    "Exact key order:",
    "{",
    '  "season": "<12-season name>",',
    '  "undertone": "Warm | Cool | Neutral-Warm | Neutral-Cool",',
    '  "contrast": "Low / soft | Medium | High / strong",',
    '  "vibe": "<3-5 word mood phrase e.g. Warm & sun-kissed glow>",',
    '  "summary": "<2 warm, specific sentences naming their actual traits and what makes them glow>",',
    '  "characteristics": ["<trait 1>", "<trait 2>", "<trait 3>", "<trait 4>"],',
    '  "best_colors": [',
    '    { "name": "<color name>", "hex": "<#rrggbb>" },  // 10 items',
    '    ...repeat for all 10',
    "  ],",
    '  "avoid_colors": [',
    '    { "name": "<color name>", "hex": "<#rrggbb>" },  // 6 items',
    "    ...repeat for all 6",
    "  ],",
    '  "neutrals": [',
    '    { "name": "<color name>", "hex": "<#rrggbb>" },  // 5 items',
    "    ...repeat for all 5",
    "  ],",
    '  "metals": ["<metal 1>", "<metal 2>"],',
    '  "makeup": {',
    '    "lip": "<specific lip shades e.g. warm nude, terracotta, dusty rose>",',
    '    "cheek": "<specific blush tones e.g. peachy coral, warm bronze>",',
    '    "eyes": "<specific eye shadow tones e.g. brown, warm taupe, bronze>"',
    "  },",
    '  "hair": {',
    '    "colors": ["<hair color 1>", "<hair color 2>", "<hair color 3>", "<hair color 4>"],',
    '    "styles": ["<flattering cut/style 1>", "<style 2>", "<style 3>"],',
    '    "avoid": ["<what washes them out 1>", "<what washes them out 2>"]',
    "  },",
    hijabLine +
    '  "glasses": {',
    '    "best": ["<frame style 1>", "<frame style 2>", "<frame style 3>"],',
    '    "avoid": ["<what to avoid 1>", "<what to avoid 2>"]',
    "  }",
    "}",
    "",
    "RULES:",
    "• Hex codes must be accurate and realistic — match the actual colour name.",
    "• All recommendations must be specific to THIS person's real colouring, never generic.",
    "• If lighting is mixed or unclear, make your best assessment and note it briefly in summary.",
    "• Be warm, encouraging and precise in tone.",
  ].join("\n");
}
