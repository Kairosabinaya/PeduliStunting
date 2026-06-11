import { Bricolage_Grotesque } from "next/font/google";

/**
 * Editorial display typeface (Bricolage Grotesque), exposed as `--font-display`
 * and consumed by the `font-display` Tailwind family + the `.display-stat` /
 * `.section-headline` typography utilities. Loaded once here and applied via
 * `displayFont.variable` on the surfaces that opt into editorial headings
 * (the landing shell and the public dashboard), so the rest of the app keeps
 * Plus Jakarta Sans.
 */
export const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  // "optional" for the same reason as the body font (see src/app/layout.tsx):
  // a swap-repaint of the landing headline re-issued the LCP entry seconds
  // after first paint on throttled mobile.
  display: "optional",
  variable: "--font-display",
});
