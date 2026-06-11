import { Badge } from "@/components/primitives/badge";
import { Card } from "@/components/primitives/card";
import { Slider } from "@/components/primitives/slider";
import { DASHBOARD_SIMULATOR } from "@/config/dashboard";
import { cn } from "@/lib/cn";

export interface SimulatorSlider {
  /** Position in the canonical X1..X20 value/beta arrays. */
  readonly index: number;
  readonly code: string;
  readonly name: string;
  readonly unit: string | null;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** The region's original (default) value, shown as a reference dot. */
  readonly defaultValue: number;
  /** True when the local coefficient is zero (selected out). */
  readonly inactive: boolean;
}

export interface PredictorSliderGroupProps {
  readonly title: string;
  readonly sliders: readonly SimulatorSlider[];
  readonly values: readonly number[];
  readonly onValueChange: (index: number, value: number) => void;
  readonly formatValue: (value: number, unit: string | null) => string;
  /**
   * Widen the gap between sliders. Used to grow the right column so both
   * simulator columns end at roughly the same height.
   */
  readonly roomy?: boolean;
}

/**
 * One dimension's worth of predictor sliders (Sosial-Ekonomi, Kesehatan, ...).
 * Selected-out predictors (zero local coefficient) render disabled with a
 * "tidak berpengaruh" badge so the user sees they cannot move the prediction.
 */
export function PredictorSliderGroup({
  title,
  sliders,
  values,
  onValueChange,
  formatValue,
  roomy = false,
}: PredictorSliderGroupProps) {
  if (sliders.length === 0) return null;
  return (
    <Card elevation="sm" padding="md">
      <fieldset className="space-y-4">
        <legend className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="h-5 w-1.5 rounded-full bg-primary" aria-hidden />
          {title}
        </legend>
        <div className={cn(roomy ? "space-y-8" : "space-y-5")}>
          {sliders.map((slider) => (
            <div
              key={slider.code}
              // `grayscale` + 90% opacity still reads as "inactive" but keeps
              // the muted text above the 4.5:1 floor that the old 70% dim
              // broke on the dark simulator card (axe color-contrast).
              className={cn(
                "space-y-1",
                slider.inactive && "opacity-90 grayscale",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium leading-snug text-foreground">
                  <span className="font-mono text-muted-foreground">
                    {slider.code}
                  </span>{" "}
                  {slider.name}
                </span>
                {slider.inactive ? (
                  <Badge tone="neutral">
                    {DASHBOARD_SIMULATOR.inactiveBadge}
                  </Badge>
                ) : null}
              </div>
              <Slider
                value={values[slider.index] ?? slider.min}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                marker={slider.defaultValue}
                markerLabel={DASHBOARD_SIMULATOR.baselineMarkerLabel}
                disabled={slider.inactive}
                onChange={(value) => onValueChange(slider.index, value)}
                formatValue={(value) => formatValue(value, slider.unit)}
                ariaLabel={slider.name}
              />
            </div>
          ))}
        </div>
      </fieldset>
    </Card>
  );
}
