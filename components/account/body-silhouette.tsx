/**
 * Decorative SVG body silhouette with labelled measurement points. Used in the
 * sizing form to make the fields more intuitive. Server component — no
 * interactivity needed; the form fields themselves are the input.
 */
export function BodySilhouette() {
  return (
    <svg
      viewBox="0 0 200 360"
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
    >
      {/* Body outline — soft, editorial line */}
      <g
        stroke="#1F1B16"
        strokeOpacity="0.4"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head */}
        <circle cx="100" cy="30" r="18" />
        {/* Neck */}
        <path d="M92 48 L92 60 Q100 64 108 60 L108 48" />
        {/* Shoulders → arms */}
        <path d="M60 72 Q100 60 140 72" />
        <path d="M60 72 Q42 130 52 200" />
        <path d="M140 72 Q158 130 148 200" />
        {/* Torso sides */}
        <path d="M64 80 Q56 140 70 180 Q64 220 78 250 L92 260" />
        <path d="M136 80 Q144 140 130 180 Q136 220 122 250 L108 260" />
        {/* Hips → legs */}
        <path d="M78 260 Q90 320 90 350" />
        <path d="M122 260 Q110 320 110 350" />
      </g>

      {/* Measurement guide lines + labels */}
      <g fontFamily="Inter, sans-serif" fontSize="9" fill="#7A8B6F">
        {/* Shoulder */}
        <line x1="62" y1="72" x2="138" y2="72" stroke="#C68F6B" strokeDasharray="3 3" />
        <text x="146" y="75">Bahu</text>

        {/* Bust */}
        <line x1="64" y1="105" x2="136" y2="105" stroke="#C68F6B" strokeDasharray="3 3" />
        <text x="146" y="108">Dada</text>

        {/* Waist */}
        <line x1="68" y1="155" x2="132" y2="155" stroke="#C68F6B" strokeDasharray="3 3" />
        <text x="146" y="158">Pinggang</text>

        {/* Hip */}
        <line x1="72" y1="210" x2="128" y2="210" stroke="#C68F6B" strokeDasharray="3 3" />
        <text x="146" y="213">Pinggul</text>

        {/* Length (vertical guide) */}
        <line x1="40" y1="72" x2="40" y2="260" stroke="#C68F6B" strokeDasharray="3 3" />
        <text x="6" y="170">Panjang</text>
      </g>
    </svg>
  );
}
