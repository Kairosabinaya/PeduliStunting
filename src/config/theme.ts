/**
 * Theme configuration. Three options are exposed to users; `system` defers
 * to the OS preference until they pick light or dark explicitly.
 */
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

/** Concrete theme actually rendered (system resolves to one of these). */
export type ResolvedTheme = "light" | "dark";

/** localStorage key used by the client theme provider. */
export const THEME_STORAGE_KEY = "peduli-stunting:theme";

/**
 * Browser chrome colour (PWA `theme-color`) for each resolved theme. Values
 * MUST stay in sync with `--color-background` in `src/styles/globals.css`
 * — the only legitimate place where hex values are duplicated, because
 * Next.js metadata is serialised at build time and cannot read CSS
 * variables. Update both files together if the background ever changes.
 */
export const BROWSER_THEME_COLOR: Record<ResolvedTheme, string> = {
  light: "#fafaf8",
  dark: "#0e1013",
};
