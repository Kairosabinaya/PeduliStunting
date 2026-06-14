"use client";

import { Badge } from "@/components/primitives/badge";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import {
  GROWTH_INDICATOR_PARENT_LABEL,
  SD_CLASS_DISPLAY,
  type SdClassDisplay,
} from "@/config/tracker";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

/**
 * On an active (selected) pill the background is `bg-primary` (dark blue), where
 * the muted semantic badge tones (e.g. faint-red `danger`) lose contrast. Swap
 * to the solid ordinal tones — same hue, white text + label-shadow — so the
 * status stays legible. Hue still encodes severity: danger→red (tinggi),
 * warning→yellow (sedang), success→green (rendah).
 */
const ACTIVE_BADGE_TONE = {
  danger: "tinggi",
  warning: "sedang",
  success: "rendah",
  primary: "primary",
  neutral: "neutral",
} as const satisfies Record<SdClassDisplay["tone"], string>;

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
                tone={active ? ACTIVE_BADGE_TONE[display.tone] : display.tone}
                className="px-1.5 py-0 text-xs"
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
