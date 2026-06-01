import { THEME_STORAGE_KEY } from "@/config/theme";

const SCRIPT = `(() => {
  try {
    const stored = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = stored === 'dark' || stored === 'light'
      ? stored
      : (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {}
})();`;

/**
 * Inline script that runs before React hydration so the correct theme is
 * applied to `<html>` on first paint and the user does not see a flash of
 * the wrong palette.
 *
 * In React 19 / Next.js 16, scripts rendered inside components are SSR-only
 * (React does not execute them on the client). The `suppressHydrationWarning`
 * prop tells React to skip the attribute mismatch check on this element so
 * the no-flash script can live in the server HTML without producing hydration
 * warnings. No `type` trickery is needed; React 19 handles this correctly.
 */
export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
