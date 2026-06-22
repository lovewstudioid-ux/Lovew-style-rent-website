/** Body-type detection from bust / waist / hip (cm). */

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

  const diffBH = (b - h) / h; // + means bust wider than hip
  const waistDefined = w <= 0.75 * h;

  if (w >= b * 0.95 && w >= h * 0.95)
    return { type: "Apple / Round", note: "Weight sits around the midsection — show off your legs and create long vertical lines." };
  if (diffBH > 0.05)
    return { type: "Inverted Triangle", note: "Shoulders/bust are wider than hips — balance with fuller skirts and detailed bottoms." };
  if (diffBH < -0.05)
    return { type: "Pear / Triangle", note: "Hips are wider than shoulders — highlight your waist and draw the eye upward." };
  if (waistDefined)
    return { type: "Hourglass", note: "Balanced bust & hips with a defined waist — emphasise the waist with fitted, wrap shapes." };
  return { type: "Rectangle", note: "Balanced top to bottom with a soft waist — create curves with belts, peplums and layers." };
}
