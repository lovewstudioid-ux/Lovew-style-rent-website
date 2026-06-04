"use client";

import { useEffect, useState } from "react";

/** Live MM:SS countdown to the given ISO timestamp. */
export function Countdown({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const remaining = Math.max(0, target - now);
  const mm = Math.floor(remaining / 60_000).toString().padStart(2, "0");
  const ss = Math.floor((remaining % 60_000) / 1_000).toString().padStart(2, "0");
  return (
    <span suppressHydrationWarning>
      {mm}:{ss}
    </span>
  );
}
