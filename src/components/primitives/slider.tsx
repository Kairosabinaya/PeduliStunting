"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/cn";

export interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange"
  > {
  /** Controlled numeric value. */
  readonly value: number;
  /** Inclusive lower bound. */
  readonly min: number;
  /** Inclusive upper bound. */
  readonly max: number;
  /** Step granularity. */
  readonly step: number;
  /** Called whenever the value changes (numeric, already parsed). */
  readonly onChange: (next: number) => void;
  /** Optional formatter for the live value display (e.g. unit suffix). */
  readonly formatValue?: (value: number) => string;
  /** Optional list of tick labels rendered beneath the track. */
  readonly ticks?: readonly { readonly value: number; readonly label: string }[];
  /** Optional helper text rendered below the slider. */
  readonly hint?: string;
  /** Override the auto-generated aria-label when the field has no visible label. */
  readonly ariaLabel?: string;
}

/**
 * Range input wrapper with a live numeric readout, optional discrete ticks,
 * and full keyboard support (arrow keys, Home/End, PageUp/PageDown via the
 * browser). Touch target meets project guidelines section 9 (44px minimum) on coarse
 * pointers via an h-11 native control.
 *
 * @example Numeric what-if delta
 * ```tsx
 * <Slider
 *   value={delta}
 *   min={-3}
 *   max={3}
 *   step={0.1}
 *   onChange={setDelta}
 *   ariaLabel="Perubahan nilai prediktor"
 *   formatValue={(v) => v.toFixed(2)}
 * />
 * ```
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    min,
    max,
    step,
    onChange,
    formatValue,
    ticks,
    hint,
    ariaLabel,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const display = formatValue ? formatValue(value) : value.toString();

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-3">
        {ariaLabel ? (
          <span className="sr-only" id={`${inputId}-label`}>
            {ariaLabel}
          </span>
        ) : null}
        <output
          htmlFor={inputId}
          aria-live="polite"
          className="font-mono text-lg tabular-nums text-foreground"
        >
          {display}
        </output>
        <span className="text-xs text-muted-foreground">
          {min} – {max}
        </span>
      </div>
      <input
        ref={ref}
        type="range"
        id={inputId}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? `${inputId}-label` : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
        className="mt-2 h-11 w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        {...rest}
      />
      {ticks && ticks.length > 0 ? (
        <ul className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          {ticks.map((tick) => (
            <li key={tick.value} className="font-mono tabular-nums">
              {tick.label}
            </li>
          ))}
        </ul>
      ) : null}
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});
