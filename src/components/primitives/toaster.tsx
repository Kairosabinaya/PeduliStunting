"use client";

// Client because Sonner renders a portal and subscribes to the theme store via
// `useTheme` (browser-only context).

import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "@/components/theme/theme-provider";
import { TOAST_DURATION_MS } from "@/config/toast";

/**
 * App-wide toast surface. Mounted once in the root layout so any client
 * component can fire notifications via `toast()` from `sonner`. Colours follow
 * the active theme so success/error toasts stay legible in light and dark.
 *
 * @example
 * ```tsx
 * import { toast } from "sonner";
 * toast.success("Tersimpan", { description: "Perubahan profil disimpan." });
 * ```
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="top-right"
      richColors
      closeButton
      duration={TOAST_DURATION_MS}
    />
  );
}
