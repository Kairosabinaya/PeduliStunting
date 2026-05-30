import { Badge } from "@/components/primitives/badge";
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
  /** True when the local coefficient is zero (selected out). */
  readonly inactive: boolean;
}

export interface PredictorSliderGroupProps {
  readonly title: string;
  readonly sliders: readonly SimulatorSlider[];
  readonly values: readonly number[];
  readonly onValueChange: (index: number, value: number) => void;
  readonly formatValue: (value: number, unit: string | null) => string;
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
}: PredictorSliderGroupProps) {
  if (sliders.length === 0) return null;
  return (
    <fieldset className="space-y-4">
      <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="h-4 w-1 rounded-full bg-primary" aria-hidden />
        {title}
      </legend>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {sliders.map((slider) => (
          <div
            key={slider.code}
            className={cn("space-y-1", slider.inactive && "opacity-60")}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium leading-snug text-foreground">
                {slider.name}
              </span>
              {slider.inactive ? (
                <Badge tone="neutral" title={DASHBOARD_SIMULATOR.inactiveHint}>
                  {DASHBOARD_SIMULATOR.inactiveBadge}
                </Badge>
              ) : null}
            </div>
            <Slider
              value={values[slider.index] ?? slider.min}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              disabled={slider.inactive}
              onChange={(value) => onValueChange(slider.index, value)}
              formatValue={(value) => formatValue(value, slider.unit)}
              ariaLabel={slider.name}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}
