"use client";

// Client because Sonner renders a portal and subscribes to the theme store via
// `useTheme` (browser-only context).

import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "@/components/theme/theme-provider";
import { TOAST_DURATION_MS } from "@/config/toast";

/**
 * App-wide toast surface. Mounted once in the root layout. Notifications are
 * fired through `notify` ({@link file://../../lib/notify.tsx}), which renders the
 * branded `ToastCard` via `toast.custom` — so this only positions the portal.
 * `richColors`/`closeButton` are off because the card supplies its own design
 * tokens and dismiss control; keeping them would double up the chrome.
 *
 * @example
 * ```tsx
 * import { notify } from "@/lib/notify";
 * notify.success("Tersimpan.", "Perubahan profil disimpan.");
 * ```
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="top-right"
      duration={TOAST_DURATION_MS}
    />
  );
}
