// Prev/next arrow control for the ACT 9 quiz. Lives on the always-dark quiz
// band, so the styling is light-on-dark. Disabled when navigation in that
// direction is unavailable (no previous question / current not yet answered).

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

export interface QuizNavButtonProps {
  readonly direction: "prev" | "next";
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly className?: string;
}

/**
 * A single 44px round arrow button. The icon is decorative; the accessible
 * name comes from `aria-label` so screen-reader users hear "Soal sebelumnya" /
 * "Soal berikutnya".
 *
 * @example
 * ```tsx
 * <QuizNavButton direction="prev" label="Soal sebelumnya" onClick={prev} disabled={!canPrev} />
 * ```
 */
export function QuizNavButton({
  direction,
  label,
  onClick,
  disabled,
  className,
}: QuizNavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-edu-night disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
