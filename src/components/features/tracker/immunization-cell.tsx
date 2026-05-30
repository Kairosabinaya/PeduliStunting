"use client";

import { Check, AlertTriangle, Clock, CircleDashed, Minus } from "lucide-react";

import { cn } from "@/lib/cn";
import { IMMUNIZATION_CELL_COPY } from "@/config/tracker";
import type { ImmunizationCellStatus } from "@/domain/health-plan/services/immunization-status";

export interface ImmunizationCellProps {
  readonly label: string;
  readonly status: ImmunizationCellStatus;
  readonly ariaLabel: string;
  readonly onClick: () => void;
}

const STATUS_ICON = {
  done: Check,
  upcoming: Clock,
  missed: AlertTriangle,
  future: CircleDashed,
  skipped: Minus,
} as const satisfies Record<ImmunizationCellStatus, typeof Check>;

const STATUS_CLASSES: Record<ImmunizationCellStatus, string> = {
  done: "bg-accent text-accent-foreground border-accent",
  upcoming:
    "bg-brand-100 text-brand-700 border-brand-300 dark:bg-brand-900 dark:text-brand-100 dark:border-brand-700",
  missed: "bg-ordinal-sedang/15 text-ordinal-sedang border-ordinal-sedang/50",
  future: "bg-surface-muted text-muted-foreground border-border",
  skipped: "bg-surface-muted text-muted-foreground border-border line-through",
};

/**
 * Satu sel pada timeline imunisasi: kotak ringkas dengan ikon status,
 * kode vaksin, dan label dosis. Diketuk → membuka detail sheet pada parent.
 *
 * Tone warna sengaja lembut (tidak ada merah pekat) supaya orang tua tidak
 * "ditegur" — yang penting urgensi tersampaikan oleh ikon + label.
 */
export function ImmunizationCell({
  label,
  status,
  ariaLabel,
  onClick,
}: ImmunizationCellProps) {
  const Icon = STATUS_ICON[status];
  const copy = IMMUNIZATION_CELL_COPY[status];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "flex w-full min-w-[112px] flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left text-xs transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        STATUS_CLASSES[status],
      )}
    >
      <span className="flex items-center gap-1 font-semibold">
        <Icon size={14} aria-hidden />
        <span>{label}</span>
      </span>
      <span className="text-[10px] uppercase tracking-wider opacity-80">
        {copy.label}
      </span>
    </button>
  );
}
