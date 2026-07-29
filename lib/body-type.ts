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
 *   Pear               hips clearly bigger than bust (includes FFIT's "spoon"
 *                      high-hip-shelf variant — grouped as Pear to keep it simple)
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

  // 4. Pear — hips clearly wider than shoulders (includes the "spoon" high-hip
  // shelf variant; both are grouped as Pear to keep the set simple).
  if (
    (hipVsBust >= 3.6 && hipVsWaist < 9) ||
    (hipVsBust > 2 && hipVsWaist >= 7 && hh > 0 && hh - w >= 0.193 * w)
  )
    return {
      type: "Pear",
      note: "Hips are wider than the shoulders — highlight your waist and draw the eye upward with detailed, structured tops.",
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
