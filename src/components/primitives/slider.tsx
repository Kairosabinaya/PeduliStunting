"use client";

import { forwardRef, useId, useRef } from "react";

import { cn } from "@/lib/cn";

/**
 * Magnetic snap zone for {@link SliderProps.marker}, as a fraction of the track
 * range. While dragging with a pointer, a value landing within this distance of
 * the marker snaps exactly onto it. Kept small and pointer-only so it never
 * traps keyboard users and stays easy to drag past.
 */
const MARKER_SNAP_FRACTION = 0.02;

/** Locale-formatted bound with thousands separators (e.g. 253.877). */
function formatBound(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

export interface SliderProps extends Omit<
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
  readonly ticks?: readonly {
    readonly value: number;
    readonly label: string;
  }[];
  /**
   * Optional reference value rendered as a fixed dot on the track (e.g. a
   * region's original/default value), so the live thumb can be compared to it.
   */
  readonly marker?: number;
  /** Accessible/hover label for {@link marker} (rendered as the dot's title). */
  readonly markerLabel?: string;
  /** Optional helper text rendered below the slider. */
  readonly hint?: string;
  /** Override the auto-generated aria-label when the field has no visible label. */
  readonly ariaLabel?: string;
}

/**
 * Range input wrapper with a live numeric readout, optional discrete ticks,
 * and full keyboard support (arrow keys, Home/End, PageUp/PageDown via the
 * browser). Touch target meets the 44px minimum on coarse pointers via an
 * h-11 native control.
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
 *
 * @example With an original-value reference dot
 * ```tsx
 * <Slider
 *   value={current}
 *   min={0}
 *   max={100}
 *   step={1}
 *   onChange={setCurrent}
 *   marker={baseline}
 *   markerLabel="Nilai asli wilayah"
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
    marker,
    markerLabel,
    hint,
    ariaLabel,
    className,
    id,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const display = formatValue ? formatValue(value) : value.toString();
  const pointerActive = useRef(false);
  const clampFraction = (raw: number): number =>
    max > min ? Math.max(0, Math.min(1, (raw - min) / (max - min))) : 0;
  const valueFraction = clampFraction(value);
  const markerFraction = marker !== undefined ? clampFraction(marker) : null;
  // Inset-aware position: the thumb centre travels from half a thumb-width in
  // to half a thumb-width from the end, so a plain percentage would drift at the
  // extremes. Sharing this calc across thumb, fill, and marker keeps them exact.
  const positionAt = (fraction: number): string =>
    `calc(var(--slider-thumb) / 2 + (100% - var(--slider-thumb)) * ${fraction})`;

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
          {formatBound(min)} – {formatBound(max)}
        </span>
      </div>
      {/* Custom visual slider: a transparent native input on top owns all
          interaction, keyboard support, and ARIA, while the rail, fill, marker,
          and thumb are DIVs sharing one position calc. The thumb is painted last
          so it covers the original-value marker exactly when they coincide. */}
      <div className="slider-track relative mt-2 h-11">
        <input
          ref={ref}
          type="range"
          id={inputId}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? `${inputId}-label` : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={display}
          onPointerDown={() => {
            pointerActive.current = true;
          }}
          onPointerUp={() => {
            pointerActive.current = false;
          }}
          onPointerCancel={() => {
            pointerActive.current = false;
          }}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            if (!Number.isFinite(parsed)) return;
            // Magnetic snap: while dragging, land exactly on the reference
            // marker when the value passes close to it. Pointer-only so keyboard
            // users can still step freely past it.
            if (
              marker !== undefined &&
              pointerActive.current &&
              Math.abs(parsed - marker) <= (max - min) * MARKER_SNAP_FRACTION
            ) {
              onChange(marker);
              return;
            }
            onChange(parsed);
          }}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...rest}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-muted"
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full",
            disabled ? "bg-muted-foreground/40" : "bg-accent",
          )}
          style={{ width: positionAt(valueFraction) }}
        />
        {markerFraction !== null ? (
          <span
            aria-hidden
            title={markerLabel}
            className={cn(
              "pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-surface shadow-sm",
              disabled ? "border-muted-foreground/40" : "border-accent",
            )}
            style={{ left: positionAt(markerFraction) }}
          />
        ) : null}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            disabled ? "bg-muted-foreground/50" : "bg-accent",
          )}
          style={{ left: positionAt(valueFraction) }}
        />
      </div>
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
