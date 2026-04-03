/** SimulationSlider — range slider for a single predictor variable. */
"use client";

import { cn } from "@/lib/utils";

interface SimulationSliderProps {
  code: string;
  label: string;
  unit: string | null;
  value: number;
  originalValue: number;
  min: number;
  max: number;
  onChange: (code: string, value: number) => void;
}

export function SimulationSlider({
  code,
  label,
  unit,
  value,
  originalValue,
  min,
  max,
  onChange,
}: SimulationSliderProps) {
  const isModified = value !== originalValue;
  const delta = value - originalValue;
  const step = (max - min) / 200;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate mr-2">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-foreground/80">
            {value.toFixed(1)}
          </span>
          {unit && (
            <span className="text-foreground/50 text-xs">{unit}</span>
          )}
          {isModified && (
            <span
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                delta > 0
                  ? "bg-primary-50 text-primary-700"
                  : "bg-accent-50 text-accent-500"
              )}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(code, parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-primary-100 accent-primary-600"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-xs text-foreground/40">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}
