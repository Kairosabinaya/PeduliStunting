"use client";

import { Button } from "@/components/primitives/button";
import { cn } from "@/lib/cn";

import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  readonly className?: string;
}

/**
 * Icon-sized button that flips between light and dark. When the active
 * theme is `system`, the first click resolves to the opposite of the
 * current OS preference. Pair with {@link useTheme} for fuller controls
 * (light / dark / system).
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap";

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
