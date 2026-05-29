"use client";

import { Badge } from "@/components/primitives/badge";
import { cn } from "@/lib/cn";
import { GROWTH_INDICATOR_SHORT, SD_CLASS_DISPLAY } from "@/config/tracker";
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
 * Tab pills untuk memilih indikator yang ditampilkan di kurva. Mengganti
 * Select dropdown sebelumnya — pills lebih mudah dilihat sekilas dan
 * memungkinkan menempelkan badge SD-class kecil per indikator agar status
 * terbaru langsung terlihat tanpa membuka kurva.
 */
export function IndicatorTabs({
  value,
  onChange,
  latestSdClass,
}: IndicatorTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {GROWTH_INDICATORS.map((indicator) => {
        const isActive = indicator === value;
        const sd = latestSdClass[indicator];
        const display = sd ? SD_CLASS_DISPLAY[sd] : undefined;
        return (
          <button
            key={indicator}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(indicator)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-surface-muted text-foreground hover:bg-surface",
            )}
          >
            <span>{GROWTH_INDICATOR_SHORT[indicator]}</span>
            {display ? (
              <Badge
                tone={display.tone}
                className={cn(
                  "px-1.5 py-0 text-[10px]",
                  isActive && "ring-1 ring-white/40",
                )}
              >
                {display.label}
              </Badge>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
