import { cn } from "@/lib/cn";

export interface ScrollPromptProps {
  /** Visible label shown above the chevron. */
  readonly label: string;
  /** Hash target the chevron link scrolls to. Defaults to the first ACT 3. */
  readonly targetId?: string;
  readonly className?: string;
}

/**
 * Animated cue that invites the reader to scroll. Renders as a focusable
 * anchor so keyboard users can jump straight to the next section. The
 * bounce uses the `edu-bounce` Tailwind animation declared in
 * `tailwind.config.ts`, which is auto-disabled by the global
 * `prefers-reduced-motion` block in `globals.css`.
 *
 * @example Hero scroll prompt
 * ```tsx
 * <ScrollPrompt label="Scroll untuk memahami" targetId="act-3" />
 * ```
 */
export function ScrollPrompt({
  label,
  targetId = "act-3",
  className,
}: ScrollPromptProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "group inline-flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
        "transition-colors hover:text-primary focus-visible:text-primary",
        className,
      )}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="animate-edu-bounce text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </a>
  );
}
