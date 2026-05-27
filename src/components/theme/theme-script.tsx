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
 * the wrong palette. The browser executes it as it parses the SSR'd HTML;
 * React never re-executes scripts on subsequent client renders, which is
 * fine because the document already carries the resolved theme by then.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
