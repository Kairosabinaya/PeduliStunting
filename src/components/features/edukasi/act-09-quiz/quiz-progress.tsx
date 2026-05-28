import { cn } from "@/lib/cn";

export interface QuizProgressProps {
  /** Index of the question being shown (1-based). */
  readonly current: number;
  /** Total number of questions. */
  readonly total: number;
  /** Bahasa Indonesia label rendered for screen readers. */
  readonly ariaLabel: string;
}

/**
 * Series of round indicators showing quiz progress. Pure presentation,
 * keyboard-irrelevant (the dots are aria-hidden — the readable label sits
 * alongside in the parent component).
 */
export function QuizProgress({ current, total, ariaLabel }: QuizProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, index) => {
        const filled = index < current;
        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              filled ? "bg-white" : "bg-white/25",
            )}
          />
        );
      })}
    </div>
  );
}
