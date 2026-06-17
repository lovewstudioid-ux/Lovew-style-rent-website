/**
 * Master prompts for the Style ID color-analysis generator.
 *
 * Consolidated from the studio's working prompts into two clean variants:
 *   - hijab     → editorial poster with hijab shortlist + hijab style guide
 *   - non-hijab → same poster, with hair colour + hairstyle guide instead
 *
 * Both produce ONE 9:16 editorial infographic poster, personalised to the
 * uploaded portrait. Visual-first, short labels only, no paragraphs.
 */

export interface StyleIdInput {
  wearsHijab: boolean;
}

const SHARED_HEADER =
  "Create an aesthetic editorial infographic poster with the subject's personal colour analysis results. " +
  "Use the uploaded portrait as the main reference and preserve her exact identity, face, and features. " +
  "Include only colours, makeup shades, and styles that genuinely enhance the subject's complexion.";

const SHARED_DESIGN =
  "Design style: aesthetic editorial infographic, warm neutral background, elegant serif typography, " +
  "realistic beauty-consultant aesthetic. Visual-first, short labels only, no paragraphs. " +
  "The analysis must be personalised to the uploaded face, not generic. Aspect ratio 9:16.";

const GLASSES_SECTION =
  "GLASSES STYLE GUIDE — realistic, flattering glasses on the same subject. Consider soft rectangle, round, " +
  "oval, cat-eye, geometric, oversized, and rimless styles in tortoiseshell, warm brown, soft gold, matte black, " +
  "clear, and silver. Label frames “Most Flattering”, “Good Options”, and “Avoid”, and highlight the best match.";

const HIJAB_PROMPT = [
  SHARED_HEADER,
  "Generate these sections, each as a compact visual block:",
  "1. YOUR PERSONAL COLOUR ANALYSIS — name her season / palette.",
  "2. COLOUR COMPARISON — side-by-side examples of flattering vs unflattering colours on the subject.",
  "3. LIP & CHEEK COLOURS — shades that naturally brighten her skin tone.",
  "4. HIJAB SHORTLIST — hijab colours that suit her.",
  "5. HIJAB STYLE GUIDE — multiple realistic hijab styles on the same woman.",
  "6. 5 BEST COLOURS FOR YOU.",
  "7. 5 COLOURS TO AVOID.",
  "8. " + GLASSES_SECTION,
  SHARED_DESIGN,
].join("\n");

const NON_HIJAB_PROMPT = [
  SHARED_HEADER,
  "Generate these sections, each as a compact visual block:",
  "1. YOUR PERSONAL COLOUR ANALYSIS — name her season / palette.",
  "2. COLOUR COMPARISON — side-by-side examples of flattering vs unflattering colours on the subject.",
  "3. LIP & CHEEK COLOURS — shades that naturally brighten her skin tone.",
  "4. HAIR COLOUR SHORTLIST — hair shades that suit her.",
  "5. HAIRSTYLE GUIDE — multiple realistic, flattering hairstyles on the same subject.",
  "6. 5 BEST COLOURS FOR YOU.",
  "7. 5 COLOURS TO AVOID.",
  "8. " + GLASSES_SECTION,
  SHARED_DESIGN,
].join("\n");

export function buildPrompt({ wearsHijab }: StyleIdInput): string {
  return wearsHijab ? HIJAB_PROMPT : NON_HIJAB_PROMPT;
}
