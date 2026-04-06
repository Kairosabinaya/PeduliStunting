/** FloatingSummaryPanel — floating national stunting summary card overlaid on map (top-left). */
"use client";

import { useMemo } from "react";
import { STUNTING_COLORS } from "@/lib/constants";
import type { StuntingCategory } from "@/types/database";

interface StuntingEntry {
  prevalenceRate: number;
  category: StuntingCategory;
}

interface FloatingSummaryPanelProps {
  stuntingData: Map<number, StuntingEntry>;
  selectedYear: number;
  isLoading: boolean;
}

const CATEGORY_ORDER: StuntingCategory[] = ["Rendah", "Sedang", "Tinggi"];
const TOTAL_PROVINCES = 34;

export function FloatingSummaryPanel({
  stuntingData,
  selectedYear,
  isLoading,
}: FloatingSummaryPanelProps) {
  const stats = useMemo(() => {
    if (stuntingData.size === 0) return null;

    let totalPrevalence = 0;
    const categoryCounts: Record<StuntingCategory, number> = {
      Rendah: 0,
      Sedang: 0,
      Tinggi: 0,
    };

    for (const entry of stuntingData.values()) {
      totalPrevalence += entry.prevalenceRate;
      categoryCounts[entry.category]++;
    }

    return {
      averagePrevalence: totalPrevalence / stuntingData.size,
      categoryCounts,
      totalProvinces: stuntingData.size,
    };
  }, [stuntingData]);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
            Ringkasan Nasional
          </p>
          <p className="text-xs text-foreground/40">Indonesia</p>
        </div>
        <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
          {selectedYear}
        </span>
      </div>

      {isLoading || !stats ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-gray-100 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ) : (
        <>
          {/* Average prevalence */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-foreground">
              {stats.averagePrevalence.toFixed(1)}
              <span className="text-sm font-normal text-foreground/40 ml-1">
                %
              </span>
            </p>
            <p className="text-xs text-foreground/50">Rata-rata prevalensi</p>
          </div>

          {/* Category breakdown */}
          <div className="space-y-2.5">
            {CATEGORY_ORDER.map((category) => {
              const count = stats.categoryCounts[category];
              const percentage = (count / TOTAL_PROVINCES) * 100;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: STUNTING_COLORS[category] }}
                      />
                      <span className="text-xs text-foreground/70">
                        {category}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-foreground/80">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: STUNTING_COLORS[category],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-foreground/40">
              {stats.totalProvinces} Provinsi
            </span>
            <span className="text-[10px] text-foreground/40">
              Model GTWENOLR
            </span>
          </div>
        </>
      )}
    </div>
  );
}
