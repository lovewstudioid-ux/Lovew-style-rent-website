/**
 * Body-type detection from bust / waist / hip measurements (cm).
 *
 * Uses absolute centimetre differences — the standard used by professional
 * stylists and fashion calculators.
 *
 * Thresholds (cm):
 *   Apple          waist < 9 cm smaller than BOTH bust and hip
 *   Inverted ▲    bust ≥ hip + 7 cm
 *   Pear ▽        hip  ≥ bust + 7 cm
 *   Hourglass     bust ≈ hip (within 7 cm) AND waist ≥ 20 cm smaller than hip AND ≥ 18 cm smaller than bust
 *   Soft Hourglass bust ≈ hip AND waist 12–19 cm smaller than hip
 *   Rectangle     everything else
 */

export interface BodyType {
  type: string;
  note: string;
}

function num(v: string): number {
  const n = parseFloat(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function computeBodyType(bust: string, waist: string, hip: string): BodyType | null {
  const b = num(bust), w = num(waist), h = num(hip);
  if (!b || !w || !h) return null;

  const waistVsHip  = h - w;
  const waistVsBust = b - w;
  const bustVsHip   = b - h;

  // Apple: waist nearly as wide as both hip and bust
  if (waistVsHip < 9 && waistVsBust < 9)
    return {
      type: "Apple",
      note: "Weight sits around the midsection — show off your legs and create long vertical lines.",
    };

  // Inverted Triangle: bust 7+ cm wider than hips
  if (bustVsHip >= 7)
    return {
      type: "Inverted Triangle",
      note: "Shoulders and bust are wider than hips — balance with fuller skirts and detailed bottoms.",
    };

  // Pear: hips 7+ cm wider than bust
  if (-bustVsHip >= 7)
    return {
      type: "Pear",
      note: "Hips are wider than shoulders — highlight your waist and draw the eye upward.",
    };

  // Bust and hip are within 7 cm of each other.
  // Hourglass: waist clearly defined (≥ 20 cm smaller than hip AND ≥ 18 cm smaller than bust)
  if (waistVsHip >= 20 && waistVsBust >= 18)
    return {
      type: "Hourglass",
      note: "Balanced bust and hips with a defined waist — emphasise it with fitted, wrap shapes.",
    };

  // Soft Hourglass: balanced top/bottom, moderately defined waist (12–19 cm)
  if (waistVsHip >= 12 && waistVsBust >= 10)
    return {
      type: "Soft Hourglass",
      note: "Gently balanced proportions with a softly defined waist — wrap silhouettes and belted styles work beautifully.",
    };

  return {
    type: "Rectangle",
    note: "Balanced top to bottom with a soft waist — create curves with belts, peplums and layers.",
  };
}
