"use client";

import { cn } from "@/lib/cn";
import { MILESTONE_RANGE_FILTER_COPY } from "@/config/tracker";

export type MilestoneRangeMode = "current" | "all";

export interface MilestoneRangeFilterProps {
  readonly value: MilestoneRangeMode;
  readonly onChange: (next: MilestoneRangeMode) => void;
  readonly childAgeMonths: number;
}

/**
 * Toggle dua pilihan untuk membatasi tampilan milestone:
 *   - `current` (default): milestone usia anak saat ini dan yang sudah
 *     terlewati (agar tonggak lama bisa didata/dicentang), tanpa masa depan.
 *   - `all`: semua entri katalog termasuk masa depan (mode review).
 *
 * Ditempatkan di atas grid milestone agar orang tua fokus ke "apa yang
 * relevan sampai sekarang" tanpa kewalahan oleh entri masa depan sekaligus.
 */
export function MilestoneRangeFilter({
  value,
  onChange,
  childAgeMonths,
}: MilestoneRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {MILESTONE_RANGE_FILTER_COPY.legend}
      </p>
      <div
        role="radiogroup"
        aria-label={MILESTONE_RANGE_FILTER_COPY.ariaLabel}
        className="inline-flex rounded-full border border-border bg-surface p-1"
      >
        <ModeButton
          mode="current"
          selected={value === "current"}
          label={MILESTONE_RANGE_FILTER_COPY.optionCurrent}
          onSelect={onChange}
        />
        <ModeButton
          mode="all"
          selected={value === "all"}
          label={MILESTONE_RANGE_FILTER_COPY.optionAll}
          onSelect={onChange}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {MILESTONE_RANGE_FILTER_COPY.summaryFormat(childAgeMonths)}
      </span>
    </div>
  );
}

function ModeButton({
  mode,
  selected,
  label,
  onSelect,
}: {
  readonly mode: MilestoneRangeMode;
  readonly selected: boolean;
  readonly label: string;
  readonly onSelect: (mode: MilestoneRangeMode) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(mode)}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-surface-muted",
      )}
    >
      {label}
    </button>
  );
}
