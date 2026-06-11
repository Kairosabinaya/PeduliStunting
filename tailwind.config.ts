import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          muted: "rgb(var(--color-surface-muted) / <alpha-value>)",
          inverse: "rgb(var(--color-surface-inverse) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          strong: "rgb(var(--color-border-strong) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)",
        },
        brand: {
          50: "rgb(var(--color-brand-50) / <alpha-value>)",
          100: "rgb(var(--color-brand-100) / <alpha-value>)",
          200: "rgb(var(--color-brand-200) / <alpha-value>)",
          300: "rgb(var(--color-brand-300) / <alpha-value>)",
          400: "rgb(var(--color-brand-400) / <alpha-value>)",
          500: "rgb(var(--color-brand-500) / <alpha-value>)",
          600: "rgb(var(--color-brand-600) / <alpha-value>)",
          700: "rgb(var(--color-brand-700) / <alpha-value>)",
          800: "rgb(var(--color-brand-800) / <alpha-value>)",
          900: "rgb(var(--color-brand-900) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
          soft: "rgb(var(--color-primary-soft) / <alpha-value>)",
          // Darkened tone for primary-coloured TEXT on a light background
          // (the raw `primary` only clears WCAG AA at large display sizes).
          ink: "rgb(var(--color-primary-ink) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
          // Darkened tone for accent-coloured TEXT on a light background.
          ink: "rgb(var(--color-sage-ink) / <alpha-value>)",
        },
        ordinal: {
          rendah: "rgb(var(--color-ordinal-rendah) / <alpha-value>)",
          sedang: "rgb(var(--color-ordinal-sedang) / <alpha-value>)",
          tinggi: "rgb(var(--color-ordinal-tinggi) / <alpha-value>)",
          "rendah-foreground":
            "rgb(var(--color-ordinal-rendah-foreground) / <alpha-value>)",
          "sedang-foreground":
            "rgb(var(--color-ordinal-sedang-foreground) / <alpha-value>)",
          "tinggi-foreground":
            "rgb(var(--color-ordinal-tinggi-foreground) / <alpha-value>)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        risk: "rgb(var(--color-risk) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        focus: "rgb(var(--color-focus) / <alpha-value>)",
        // Edukasi scrollytelling palette. Only the tokens that have no
        // equivalent in the project palette live here; the page reuses
        // `primary`, `primary-soft`, and `accent` for the core blues and
        // green so the scrollytelling stays visually anchored to the rest
        // of the app.
        edu: {
          warm: "rgb(var(--edu-hl-warm) / <alpha-value>)",
          flag: "rgb(var(--edu-hl-danger) / <alpha-value>)",
          "tint-warm": "rgb(var(--edu-tint-warm) / <alpha-value>)",
          "tint-cream": "rgb(var(--edu-tint-cream) / <alpha-value>)",
          night: "rgb(var(--edu-tint-night) / <alpha-value>)",
          footnote: "rgb(var(--edu-fn-color) / <alpha-value>)",
        },
        tracker: {
          growth: "rgb(var(--color-tracker-growth) / <alpha-value>)",
          immunization:
            "rgb(var(--color-tracker-immunization) / <alpha-value>)",
          milestone: "rgb(var(--color-tracker-milestone) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // Editorial display face for the landing headlines/stats. The
        // `--font-display` variable is only set on the `.theme-landing`
        // wrapper, so `font-display` falls back to the product sans elsewhere.
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.125rem" }],
        sm: ["0.875rem", { lineHeight: "1.375rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": [
          "clamp(1.75rem, 1.4rem + 1.4vw, 2.125rem)",
          { lineHeight: "1.2" },
        ],
        "4xl": ["clamp(2rem, 1.6rem + 2vw, 2.75rem)", { lineHeight: "1.15" }],
        "5xl": ["clamp(2.5rem, 1.8rem + 3vw, 3.75rem)", { lineHeight: "1.1" }],
      },
      borderRadius: {
        none: "0",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "9999px",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        focus: "var(--shadow-focus)",
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "180ms",
        slow: "260ms",
        // Longer durations used by the /edukasi scrollytelling reveals and
        // cinematic sequences. Avoid these on default UI transitions where
        // the existing `fast`/`slow` already feel snappy.
        emphatic: "600ms",
        cinematic: "1200ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        emphasized: "cubic-bezier(0.3, 0, 0, 1)",
        anticipate: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      zIndex: {
        base: "0",
        elevated: "10",
        sticky: "100",
        // `header` sits above the map canvas and floating overlays. The
        // mobile `sheet` is intentionally above the header so a fully-
        // expanded sheet covers the header pill (matches Google Maps
        // behaviour, where the place sheet eats the search bar when
        // dragged to the top).
        header: "900",
        sheet: "960",
        overlay: "1000",
        modal: "1100",
        popover: "1200",
        tooltip: "1300",
        toast: "1400",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Subtle vertical bounce used by the /edukasi scroll prompt. The
        // amplitude is intentionally small (4px) so the cue is felt without
        // becoming distracting.
        "edu-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms cubic-bezier(0.2, 0, 0, 1) both",
        "slide-in-up": "slide-in-up 220ms cubic-bezier(0.2, 0, 0, 1) both",
        "edu-bounce":
          "edu-bounce 1800ms cubic-bezier(0.65, 0, 0.35, 1) infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
