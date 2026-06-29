/**
 * Body-type detection from bust / waist / hip measurements (cm).
 *
 * Uses absolute centimetre differences — the standard used by professional
 * stylists and fashion calculators — rather than pure ratios, which tend to
 * misclassify real body shapes.
 *
 * Reference thresholds (cm):
 *   Apple         waist < 9 cm smaller than BOTH bust and hip
 *   Inverted ▲   bust ≥ hip + 5 cm
 *   Pear ▽       hip  ≥ bust + 5 cm
 *   Hourglass    bust ≈ hip (within 5 cm) AND waist ≥ 20 cm smaller than hip
 *   Rectangle    everything else
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

  const waistVsHip  = h - w;  // how much smaller waist is than hip
  const waistVsBust = b - w;  // how much smaller waist is than bust
  const bustVsHip   = b - h;  // positive = bust wider, negative = hip wider

  // Apple / Round: waist is nearly as wide as both hip and bust
  if (waistVsHip < 9 && waistVsBust < 9)
    return {
      type: "Apple / Round",
      note: "Weight sits around the midsection — show off your legs and create long vertical lines.",
    };

  // Inverted Triangle: bust is 5+ cm wider than hips
  if (bustVsHip >= 5)
    return {
      type: "Inverted Triangle",
      note: "Shoulders/bust are wider than hips — balance with fuller skirts and detailed bottoms.",
    };

  // Pear / Triangle: hips are 5+ cm wider than bust
  if (-bustVsHip >= 5)
    return {
      type: "Pear / Triangle",
      note: "Hips are wider than shoulders — highlight your waist and draw the eye upward.",
    };

  // Bust and hip are now within 5 cm of each other.
  // Hourglass: waist is clearly defined (≥ 20 cm smaller than hip AND ≥ 18 cm smaller than bust)
  if (waistVsHip >= 20 && waistVsBust >= 18)
    return {
      type: "Hourglass",
      note: "Balanced bust & hips with a defined waist — emphasise the waist with fitted, wrap shapes.",
    };

  // Soft Hourglass: bust ≈ hip but waist definition is moderate (12–19 cm)
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
