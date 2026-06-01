"use client";

import { Badge } from "@/components/primitives/badge";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import { cn } from "@/lib/cn";
import {
  GROWTH_INDICATOR_PARENT_LABEL,
  SD_CLASS_DISPLAY,
} from "@/config/tracker";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

export interface IndicatorTabsProps {
  readonly value: GrowthIndicator;
  readonly onChange: (next: GrowthIndicator) => void;
  /** Latest SD class per indicator (from the most recent measurement). */
  readonly latestSdClass: Readonly<Partial<Record<GrowthIndicator, SdClass>>>;
}

/**
 * Tab pills untuk memilih indikator yang ditampilkan di kurva. Memakai
 * primitive {@link SegmentedControl} bersama, dengan badge SD-class kecil per
 * indikator agar status terbaru langsung terlihat tanpa membuka kurva.
 */
export function IndicatorTabs({
  value,
  onChange,
  latestSdClass,
}: IndicatorTabsProps) {
  const items: readonly SegmentedControlItem<GrowthIndicator>[] =
    GROWTH_INDICATORS.map((indicator) => {
      const sd = latestSdClass[indicator];
      const display = sd ? SD_CLASS_DISPLAY[sd] : undefined;
      return {
        id: indicator,
        label: GROWTH_INDICATOR_PARENT_LABEL[indicator],
        trailing: display
          ? (active: boolean) => (
              <Badge
                tone={display.tone}
                className={cn(
                  "px-1.5 py-0 text-xs",
                  active && "ring-1 ring-white/40",
                )}
              >
                {display.label}
              </Badge>
            )
          : undefined,
      };
    });

  return (
    <SegmentedControl
      ariaLabel="Pilih indikator pertumbuhan"
      value={value}
      onValueChange={onChange}
      items={items}
    />
  );
}
