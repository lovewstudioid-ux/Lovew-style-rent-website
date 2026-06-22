"use client";

import { useState } from "react";

const CODES: [string, string][] = [
  ["+62", "🇮🇩 ID"], ["+60", "🇲🇾 MY"], ["+65", "🇸🇬 SG"], ["+63", "🇵🇭 PH"],
  ["+66", "🇹🇭 TH"], ["+84", "🇻🇳 VN"], ["+91", "🇮🇳 IN"], ["+1", "🇺🇸 US"],
  ["+44", "🇬🇧 UK"], ["+61", "🇦🇺 AU"], ["+81", "🇯🇵 JP"], ["+82", "🇰🇷 KR"],
  ["+86", "🇨🇳 CN"], ["+852", "🇭🇰 HK"], ["+971", "🇦🇪 AE"], ["+966", "🇸🇦 SA"],
];

/** Country-code dropdown + number → emits a combined value like "+628123…". */
export function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [code, setCode] = useState("+62");
  const [num, setNum] = useState(value && value.startsWith("+") ? "" : value);

  function update(c: string, n: string) {
    setCode(c);
    setNum(n);
    const digits = n.replace(/[^\d]/g, "").replace(/^0+/, "");
    onChange(digits ? `${c}${digits}` : "");
  }

  const cls = "border border-ink/15 bg-white px-3 py-3 text-sm text-ink outline-none transition-colors focus:border-wine";

  return (
    <div className="flex gap-2">
      <select value={code} onChange={(e) => update(e.target.value, num)} className={`${cls} w-24 flex-shrink-0`}>
        {CODES.map(([c, l]) => <option key={c} value={c}>{l} {c}</option>)}
      </select>
      <input
        value={num}
        onChange={(e) => update(code, e.target.value)}
        inputMode="tel"
        placeholder="812 3456 7890"
        className={`${cls} flex-1 placeholder:text-ink/35`}
      />
    </div>
  );
}
