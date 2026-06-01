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
 * The `type` is `text/javascript` on the server (so the browser executes it
 * synchronously while parsing the initial HTML, before first paint) and
 * `text/plain` on the client. The client value stops React from flagging an
 * executable `<script>` during reconciliation — the source of the dev warning
 * "Encountered a script tag while rendering React component" — while
 * `suppressHydrationWarning` silences the resulting attribute mismatch. This is
 * the Next.js-documented no-flash pattern for the App Router.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
