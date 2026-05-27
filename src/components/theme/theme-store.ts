import {
  THEMES,
  THEME_STORAGE_KEY,
  type Theme,
  type ResolvedTheme,
} from "@/config/theme";

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

type Listener = () => void;

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value);
}

/**
 * In-process broadcaster for the user-chosen theme. `useSyncExternalStore`
 * reads the current value via {@link getStoredTheme} and re-renders when
 * {@link setStoredTheme} or a cross-tab `storage` event fires. Keeping the
 * store outside React lets us avoid `setState` inside effects, which the
 * React 19 lint rule rejects.
 */
const storedThemeListeners = new Set<Listener>();
let storedThemeCache: Theme | null = null;

export function subscribeStoredTheme(listener: Listener): () => void {
  storedThemeListeners.add(listener);
  if (typeof window !== "undefined") {
    const handler = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        storedThemeCache = null;
        listener();
      }
    };
    window.addEventListener("storage", handler);
    return () => {
      storedThemeListeners.delete(listener);
      window.removeEventListener("storage", handler);
    };
  }
  return () => storedThemeListeners.delete(listener);
}

export function getStoredTheme(fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  if (storedThemeCache !== null) return storedThemeCache;
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  storedThemeCache = isTheme(raw) ? raw : fallback;
  return storedThemeCache;
}

export function setStoredTheme(next: Theme): void {
  if (typeof window === "undefined") return;
  storedThemeCache = next;
  window.localStorage.setItem(THEME_STORAGE_KEY, next);
  storedThemeListeners.forEach((listener) => listener());
}

export function subscribeSystemTheme(listener: Listener): () => void {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia(SYSTEM_THEME_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
}

export function getSystemThemeServerSnapshot(): ResolvedTheme {
  return "light";
}
