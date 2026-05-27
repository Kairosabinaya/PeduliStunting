"use client";

/**
 * Floating "Buka panduan" button that re-opens the onboarding modal on demand
 * AND auto-opens it the first time a user visits `/map` (tracked via
 * localStorage, versioned so future content revisions can re-trigger).
 *
 * Renders the modal directly so the consumer's tree stays declarative — the
 * map page just drops `<OnboardingTrigger />` somewhere over the canvas.
 */

import { useCallback, useEffect, useState } from "react";

import { ONBOARDING_COPY, ONBOARDING_STORAGE_KEY } from "@/config/map";
import { cn } from "@/lib/cn";

import { OnboardingModal } from "./onboarding-modal";

export interface OnboardingTriggerProps {
  readonly className?: string;
}

export function OnboardingTrigger({ className }: OnboardingTriggerProps) {
  const [open, setOpen] = useState(false);

  // Read localStorage once on mount. The lint rule warns about cascading
  // renders, but a one-shot client-only check is the legitimate use case here
  // (the value is impossible to know during SSR without a hydration mismatch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (seen !== "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot client-only auto-open; cannot be hoisted into a useState initialiser without hydration mismatch.
        setOpen(true);
      }
    } catch {
      // localStorage can throw in private mode / sandboxed iframes. Fall back
      // to "do not auto-open" so we don't crash the page.
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    } catch {
      // Same fall-back as above — UX still works for the rest of the session.
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "glass-panel inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium text-foreground transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          className,
        )}
      >
        <span aria-hidden className="text-base leading-none">
          ?
        </span>
        {ONBOARDING_COPY.reopenLabel}
      </button>
      <OnboardingModal open={open} onClose={handleClose} />
    </>
  );
}
