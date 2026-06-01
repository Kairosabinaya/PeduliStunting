"use client";

import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";
import { buttonVariants } from "@/components/primitives/button";
import { STATUS_HERO_COPY } from "@/config/tracker";
import { cn } from "@/lib/cn";
import { GROWTH_INDICATORS } from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";
import { SD_CLASS_DISPLAY } from "@/config/tracker";
import { ModalTrigger } from "./modal-trigger";

export interface StatusHeroClientProps {
  readonly child: ChildDto;
  readonly childAgeMonths: number;
  readonly measurements: readonly GrowthMeasurementDto[];
}

export function StatusHeroClient({
  child: _child,
  childAgeMonths,
  measurements,
}: StatusHeroClientProps) {
  const sorted = [...measurements].sort((a, b) =>
    a.measuredAt < b.measuredAt ? 1 : -1,
  );
  const latest = sorted[0];

  let hasDanger = false;
  let hasWarning = false;

  if (latest) {
    for (const indicator of GROWTH_INDICATORS) {
      const sdClass = latest.sdClass[indicator] as SdClass | undefined;
      if (sdClass) {
        const tone = SD_CLASS_DISPLAY[sdClass].tone;
        if (tone === "danger") hasDanger = true;
        if (tone === "warning") hasWarning = true;
      }
    }
  }

  let toneClass = "bg-surface border-border";
  let icon = <CheckCircle2 size={32} className="text-success" />;
  let title: string = STATUS_HERO_COPY.titleNormal;

  if (hasDanger) {
    toneClass = "bg-danger/10 border-danger/20";
    icon = <AlertCircle size={32} className="text-danger" />;
    title = STATUS_HERO_COPY.titleDanger;
  } else if (hasWarning) {
    toneClass = "bg-warning/10 border-warning/20";
    icon = <AlertCircle size={32} className="text-warning" />;
    title = STATUS_HERO_COPY.titleWarning;
  } else if (!latest) {
    icon = <AlertCircle size={32} className="text-muted-foreground" />;
    title = STATUS_HERO_COPY.emptyMeasurements;
  }

  const weightStr = latest?.weightKg ? `${latest.weightKg} kg` : "-";
  const heightStr = latest?.heightCm ? `${latest.heightCm} cm` : "-";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        toneClass,
      )}
    >
      <div className="flex items-start gap-4 sm:items-center">
        <div className="flex shrink-0 items-center justify-center rounded-full bg-background p-2.5 shadow-sm">
          {icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-sm font-medium text-muted-foreground">
            {STATUS_HERO_COPY.quickStatsFormat(
              childAgeMonths,
              weightStr,
              heightStr,
            )}
          </p>
          {latest ? (
            <p className="text-xs text-muted-foreground">
              {STATUS_HERO_COPY.lastMeasurementFormat(
                new Date(latest.measuredAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              )}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0">
        <ModalTrigger modalKey={latest ? "pengukuran" : "tambah-pengukuran"}>
          {({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full bg-background sm:w-auto",
              })}
            >
              {latest
                ? STATUS_HERO_COPY.viewDetailsCta
                : STATUS_HERO_COPY.addMeasurementCta}
              <ChevronRight size={16} className="ml-1 opacity-60" />
            </button>
          )}
        </ModalTrigger>
      </div>
    </div>
  );
}
