/** YearTimeline — vertical year selector overlaid on the right side of the map. */
"use client";

import { cn } from "@/lib/utils";

interface YearTimelineProps {
  years: readonly number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearTimeline({
  years,
  selectedYear,
  onYearChange,
}: YearTimelineProps) {
  return (
    <div className="flex flex-col items-center gap-0">
      {years.map((year, index) => {
        const isSelected = year === selectedYear;
        const isLast = index === years.length - 1;

        return (
          <div key={year} className="flex flex-col items-center">
            {/* Year dot/pill */}
            <button
              onClick={() => onYearChange(year)}
              type="button"
              className={cn(
                "relative z-10 flex items-center justify-center transition-all duration-200",
                isSelected
                  ? "w-14 h-8 rounded-full bg-primary-600 text-white text-xs font-bold shadow-md"
                  : "w-10 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-foreground/60 text-xs font-medium hover:bg-white hover:border-primary-300 hover:text-primary-600"
              )}
              aria-label={`Tahun ${year}`}
            >
              {year}
            </button>

            {/* Connecting line */}
            {!isLast && (
              <div className="w-0.5 h-3 bg-gray-200" />
            )}
          </div>
        );
      })}
    </div>
  );
}
