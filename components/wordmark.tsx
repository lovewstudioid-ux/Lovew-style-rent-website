import { cn } from "@/lib/utils";

/**
 * Brand lockups from the LOVEW house book.
 *
 * - <Wordmark> — the horizontal LOVEW · the style edition lockup (header use).
 * - <WordmarkStacked> — the primary stacked signature (LOVEW over a rule).
 * - <Monogram> — the L seal, for avatars, favicons, and ceremonial moments.
 *
 * LOVEW is always set in the display face (The Seasons → Cormorant). Colour is
 * inherited via `currentColor`, so place these on any ground and set text-wine /
 * text-chiffon / text-ink on the wrapper.
 */

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="font-display text-[1.6rem] font-semibold leading-none tracking-[0.02em]">
        LOVEW
      </span>
      <span className="h-5 w-px bg-current opacity-30" aria-hidden />
      <span className="text-[0.62rem] font-medium uppercase leading-tight tracking-[0.28em] text-wine">
        Style
      </span>
    </span>
  );
}

export function WordmarkStacked({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center", className)}>
      <span className="font-display text-4xl font-semibold leading-none tracking-[0.06em]">
        LOVEW
      </span>
      <span className="my-2 h-px w-16 bg-current opacity-40" aria-hidden />
      <span className="text-[0.6rem] font-medium uppercase tracking-[0.42em]">
        The Style Edition
      </span>
    </span>
  );
}

export function Monogram({
  className,
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-current",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="font-display font-semibold leading-none"
        style={{ fontSize: size * 0.46 }}
      >
        L
      </span>
    </span>
  );
}
