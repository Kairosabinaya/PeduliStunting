/** VariableCard — card wrapping a simulation slider with predictor metadata. */
"use client";

import type { PredictorMeta } from "@/types/database";
import { SimulationSlider } from "./simulation-slider";
import { cn } from "@/lib/utils";

interface VariableCardProps {
  meta: PredictorMeta;
  value: number;
  originalValue: number;
  onChange: (code: string, value: number) => void;
}

export function VariableCard({
  meta,
  value,
  originalValue,
  onChange,
}: VariableCardProps) {
  const isModified = value !== originalValue;
  const min = meta.minValue ?? meta.meanValue - 3 * meta.stdValue;
  const max = meta.maxValue ?? meta.meanValue + 3 * meta.stdValue;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isModified
          ? "border-primary-300 bg-primary-50/30"
          : "border-primary-100 bg-white"
      )}
    >
      <SimulationSlider
        code={meta.code}
        label={meta.nameId}
        unit={meta.unit}
        value={value}
        originalValue={originalValue}
        min={min}
        max={max}
        onChange={onChange}
      />
    </div>
  );
}
