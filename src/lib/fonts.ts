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
  display: "swap",
  variable: "--font-display",
});
