import type { Config } from "tailwindcss";

/**
 * Brand tokens are declared as CSS variables in app/globals.css and referenced
 * here, so palette hex values live in exactly one place. Never hardcode hex in
 * components — use these semantic + named tokens.
 *
 * Prefer the true brand names (wine, chiffon, ink, pearl, bone, eucalyptus…) in
 * new code. The legacy names (rose-gold, charcoal, cream, soft-blush, sage) are
 * kept for the existing app and repoint to the same brand values.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // True brand palette
        wine: "var(--wine)",
        "wine-deep": "var(--wine-deep)",
        plum: "var(--plum)",
        chiffon: "var(--chiffon)",
        pearl: "var(--pearl)",
        bone: "var(--bone)",
        eucalyptus: "var(--eucalyptus)",
        "olive-shadow": "var(--olive-shadow)",
        ink: "var(--ink)",
        // Legacy aliases (existing components) → repointed to brand palette
        "rose-gold": "var(--wine)",
        charcoal: "var(--ink)",
        cream: "var(--chiffon)",
        "soft-blush": "var(--bone)",
        sage: "var(--eucalyptus)",
        // Semantic aliases used by UI primitives
        background: "var(--chiffon)",
        foreground: "var(--ink)",
        primary: {
          DEFAULT: "var(--wine)",
          foreground: "var(--chiffon)",
        },
        secondary: {
          DEFAULT: "var(--olive-shadow)",
          foreground: "var(--chiffon)",
        },
        muted: {
          DEFAULT: "var(--bone)",
          foreground: "var(--ink)",
        },
        accent: {
          DEFAULT: "var(--eucalyptus)",
          foreground: "var(--ink)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        editorial: "72rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
