"use client";

import { useSyncExternalStore } from "react";

import { Button } from "@/components/primitives/button";
import { cn } from "@/lib/cn";

import {
  getStoredTheme,
  getSystemTheme,
  getSystemThemeServerSnapshot,
  setStoredTheme,
  subscribeStoredTheme,
  subscribeSystemTheme,
} from "./theme-store";

interface ThemeToggleProps {
  readonly className?: string;
}

/**
 * Icon-sized button that flips between light and dark. Reads the resolved
 * theme directly from the store (not from ThemeProvider context) so it
 * works anywhere in the component tree — including layouts where
 * ThemeProvider context is not propagated (React 19 Server Component
 * composition). The store is the same source of truth ThemeProvider uses.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeStoredTheme,
    () => getStoredTheme("system"),
    () => "system" as const,
  );
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemTheme,
    getSystemThemeServerSnapshot,
  );

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap";

  function toggle(): void {
    const current = getStoredTheme("system");
    const resolved: typeof systemTheme =
      current === "system" ? getSystemTheme() : current;
    setStoredTheme(resolved === "dark" ? "light" : "dark");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={toggle}
      className={cn("text-foreground", className)}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </Button>
  );
}
