import { cn } from "@/lib/cn";

export interface ProgressRingProps {
  /** Numerator (slices completed). */
  readonly value: number;
  /** Denominator (total slices). Render empty ring when `<= 0`. */
  readonly total: number;
  /** Outer diameter in pixels. Stroke scales proportionally. */
  readonly size?: number;
  /** Stroke width in pixels. */
  readonly strokeWidth?: number;
  /** Accessible label read by screen readers. */
  readonly ariaLabel: string;
  /** Optional inner content (numeric ratio, icon). */
  readonly children?: React.ReactNode;
  readonly className?: string;
  /** Tailwind text color for the progress arc. Defaults to `text-primary`. */
  readonly arcColorClass?: string;
  /** Tailwind text color for the track. Defaults to `text-border`. */
  readonly trackColorClass?: string;
}

/**
 * Minimal SVG progress ring primitive — no animation library, no deps.
 * Renders an arc of `value/total` portion of a full circle. Inner slot
 * (`children`) is centered with absolute positioning so callers can drop in
 * a ratio label like `<strong>5</strong>/9`.
 *
 * Respects `prefers-reduced-motion` by skipping CSS transitions (there are
 * none here — the ring is rendered statically per render).
 */
export function ProgressRing({
  value,
  total,
  size = 96,
  strokeWidth = 8,
  ariaLabel,
  children,
  className,
  arcColorClass = "text-primary",
  trackColorClass = "text-border",
}: ProgressRingProps) {
  const safeTotal = total > 0 ? total : 1;
  const ratio = Math.max(0, Math.min(1, value / safeTotal));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColorClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={arcColorClass}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
          {children}
        </div>
      ) : null}
    </div>
  );
}
