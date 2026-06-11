"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { type Theme, type ResolvedTheme } from "@/config/theme";

import {
  getStoredTheme,
  getSystemTheme,
  getSystemThemeServerSnapshot,
  setStoredTheme,
  subscribeStoredTheme,
  subscribeSystemTheme,
} from "./theme-store";

interface ThemeContextValue {
  readonly theme: Theme;
  readonly resolvedTheme: ResolvedTheme;
  readonly setTheme: (next: Theme) => void;
  readonly toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly defaultTheme?: Theme;
}

function applyDocumentTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

/**
 * Wraps the app to expose theme state. Theme is persisted in `localStorage`
 * and applied to `<html data-theme>` so Tailwind's `[data-theme="dark"]`
 * variant takes effect. Defaults to `system` and follows the OS preference
 * until the user picks a value.
 *
 * Both the stored theme and the system colour scheme are read through
 * {@link useSyncExternalStore}, so the server-rendered HTML can legitimately
 * differ from the first client render — React applies the server snapshot
 * during hydration and silently swaps to the client snapshot afterward
 * (avoiding hydration-mismatch warnings) without ever calling `setState`
 * inside an effect (forbidden by `react-hooks/set-state-in-effect`).
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const getStoredSnapshot = useCallback(
    () => getStoredTheme(defaultTheme),
    [defaultTheme],
  );
  const getStoredServerSnapshot = useCallback(
    () => defaultTheme,
    [defaultTheme],
  );

  const theme = useSyncExternalStore(
    subscribeStoredTheme,
    getStoredSnapshot,
    getStoredServerSnapshot,
  );

  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    getSystemThemeServerSnapshot,
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    applyDocumentTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setStoredTheme(next);
  }, []);

  const toggle = useCallback(() => {
    const current = getStoredTheme(defaultTheme);
    const resolved: ResolvedTheme =
      current === "system" ? getSystemTheme() : current;
    setStoredTheme(resolved === "dark" ? "light" : "dark");
  }, [defaultTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Read or update the active theme. Must be called from a Client Component
 * rendered below {@link ThemeProvider}; throws otherwise so misuse fails
 * loudly during development.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>.");
  }
  return context;
}
