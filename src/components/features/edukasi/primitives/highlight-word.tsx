import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/**
 * Inline "marker pen" highlight used to emphasise a single word or short
 * phrase in scrollytelling headlines. The component is intentionally
 * unstyled beyond the pill chrome and colour mapping so it slots into any
 * heading level without re-defining typography.
 *
 * Available variants map to the canonical /edukasi palette:
 * - `primary`  — deep blue (primary brand colour)
 * - `secondary` — light brand blue
 * - `success` — accent green
 * - `warm`    — accessible yellow (new edukasi token)
 * - `danger`  — rust red (new edukasi token)
 * - `white`   — for dark-band sections (ACT 9 quiz, ACT 11 closing)
 *
 * The `rotate` prop nudges the highlight by -1deg so it reads as
 * "hand-drawn marker" rather than a tidy chip. Disable on long phrases.
 *
 * @example Default primary highlight
 * ```tsx
 * <HighlightWord>stunting</HighlightWord>
 * ```
 *
 * @example Success variant without rotation
 * ```tsx
 * <HighlightWord variant="success" rotate={false}>bisa berubah</HighlightWord>
 * ```
 *
 * @example White-on-dark for closing band
 * ```tsx
 * <HighlightWord variant="white">sehat dan cerdas</HighlightWord>
 * ```
 */
const highlightVariants = cva(
  // box-decoration-break:clone keeps the chrome intact across line wraps.
  "inline-block whitespace-pre-wrap rounded-md px-2 py-0.5 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-primary-soft text-primary-foreground",
        success: "bg-accent text-accent-foreground",
        warm: "bg-edu-warm text-foreground",
        danger: "bg-edu-flag text-white",
        white: "bg-white text-primary",
      },
      rotate: {
        true: "-rotate-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      rotate: true,
    },
  },
);

export type HighlightWordVariant = NonNullable<
  VariantProps<typeof highlightVariants>["variant"]
>;

export interface HighlightWordProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof highlightVariants> {
  readonly children: React.ReactNode;
}

export function HighlightWord({
  variant,
  rotate,
  className,
  children,
  ...rest
}: HighlightWordProps) {
  return (
    <span
      className={cn(highlightVariants({ variant, rotate }), className)}
      {...rest}
    >
      {children}
    </span>
  );
}
