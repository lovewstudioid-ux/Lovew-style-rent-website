/**
 * Body-type detection using the FFIT method (Female Figure Identification
 * Technique) — the same algorithm used by mainstream body-shape calculators
 * (e.g. calculator.net). Thresholds are defined in INCHES, so we convert the
 * cm measurements first, then apply the standard rules in this exact order.
 *
 * Rules (inches), checked top to bottom:
 *   Hourglass          |bust−hips| small AND waist ≥9" smaller than bust OR ≥10" smaller than hips
 *   Bottom Hourglass   hips 3.6–10" bigger than bust AND waist ≥9" smaller than hips
 *   Top Hourglass      bust 1–10" bigger than hips AND waist ≥9" smaller than bust
 *   Spoon              hips >2" bigger than bust, defined waist, + a high-hip "shelf"
 *   Triangle (pear)    hips ≥3.6" bigger than bust, waist <9" smaller than hips
 *   Inverted Triangle  bust ≥3.6" bigger than hips, waist <9" smaller than bust
 *   Rectangle          everything else (few big differences, soft waist)
 */

export interface BodyType {
  type: string;
  note: string;
}

const CM_PER_IN = 2.54;

function num(v: string): number {
  const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function computeBodyType(
  bust: string,
  waist: string,
  hip: string,
  highHip?: string,
): BodyType | null {
  // Convert cm → inches so the standard FFIT thresholds apply directly.
  const b = num(bust) / CM_PER_IN;
  const w = num(waist) / CM_PER_IN;
  const h = num(hip) / CM_PER_IN;
  const hh = highHip ? num(highHip) / CM_PER_IN : 0;
  if (!b || !w || !h) return null;

  const bustVsHip = b - h;   // + = bust bigger
  const hipVsBust = h - b;   // + = hips bigger
  const bustVsWaist = b - w; // waist definition vs bust
  const hipVsWaist = h - w;  // waist definition vs hips

  // 1. Hourglass — balanced bust & hips, clearly defined waist
  if (bustVsHip <= 1 && hipVsBust < 3.6 && (bustVsWaist >= 9 || hipVsWaist >= 10))
    return {
      type: "Hourglass",
      note: "Balanced bust and hips with a clearly defined waist — emphasise it with fitted and wrap shapes.",
    };

  // 2. Bottom Hourglass — hips a bit wider, defined waist
  if (hipVsBust >= 3.6 && hipVsBust < 10 && hipVsWaist >= 9)
    return {
      type: "Bottom Hourglass",
      note: "Hips are a little wider than the bust with a defined waist — highlight the waist and draw the eye upward.",
    };

  // 3. Top Hourglass — bust a bit wider, defined waist
  if (bustVsHip >= 1 && bustVsHip < 10 && bustVsWaist >= 9)
    return {
      type: "Top Hourglass",
      note: "Bust is a little wider than the hips with a defined waist — balance with fuller skirts and A-line bottoms.",
    };

  // 4. Spoon — pear-like with a pronounced high-hip shelf (needs high hip)
  if (hipVsBust > 2 && hipVsWaist >= 7 && hh > 0 && hh - w >= 0.193 * w)
    return {
      type: "Spoon",
      note: "Hips are wider than the bust with a shelf at the upper hip — A-line skirts and structured tops flatter beautifully.",
    };

  // 5. Triangle (pear) — hips clearly wider than shoulders
  if (hipVsBust >= 3.6 && hipVsWaist < 9)
    return {
      type: "Triangle",
      note: "Also called a pear — hips are wider than the shoulders. Highlight your waist and draw the eye upward.",
    };

  // 6. Inverted Triangle — shoulders/bust clearly wider than hips
  if (bustVsHip >= 3.6 && bustVsWaist < 9)
    return {
      type: "Inverted Triangle",
      note: "Shoulders and bust are wider than the hips — balance with fuller skirts and detailed bottoms.",
    };

  // 7. Rectangle — few big differences, soft waist
  return {
    type: "Rectangle",
    note: "Balanced top to bottom with a soft waist — create curves with belts, peplums and layers.",
  };
}
