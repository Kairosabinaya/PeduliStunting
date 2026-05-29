"use client";

import { Badge } from "@/components/primitives/badge";
import { Modal } from "@/components/primitives/modal";
import {
  GROWTH_DETAIL_COPY,
  GROWTH_INDICATOR_LABEL,
  GROWTH_INDICATOR_SHORT,
  SD_CLASS_DISPLAY,
} from "@/config/tracker";
import type { GrowthMeasurementDto } from "@/application/tracking/dtos";
import {
  GROWTH_INDICATORS,
  type GrowthIndicator,
} from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

export interface GrowthDetailSheetProps {
  readonly measurement: GrowthMeasurementDto | null;
  readonly ageMonths: number | null;
  readonly onClose: () => void;
}

/**
 * Bottom sheet (`Modal` variant `auto`) yang memunculkan detail satu titik
 * pengukuran saat user mengetuk dot di kurva. Memuat tanggal, usia, semua
 * indikator dengan z-score + klasifikasi SD, dan catatan opsional.
 */
export function GrowthDetailSheet({
  measurement,
  ageMonths,
  onClose,
}: GrowthDetailSheetProps) {
  const open = measurement !== null;
  const description = measurement
    ? formatDateIndo(measurement.measuredAt)
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={GROWTH_DETAIL_COPY.title}
      {...(description ? { description } : {})}
    >
      {measurement ? (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {GROWTH_DETAIL_COPY.dateLabel}
              </dt>
              <dd className="mt-0.5 font-medium">
                {formatDateIndo(measurement.measuredAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                {GROWTH_DETAIL_COPY.ageLabel}
              </dt>
              <dd className="mt-0.5 font-medium">
                {ageMonths !== null
                  ? `${ageMonths} ${GROWTH_DETAIL_COPY.ageUnit}`
                  : "—"}
              </dd>
            </div>
          </dl>

          <RawMeasurements measurement={measurement} />

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {GROWTH_DETAIL_COPY.indicatorsHeading}
            </p>
            <ul className="space-y-2">
              {GROWTH_INDICATORS.map((indicator) => (
                <IndicatorRow
                  key={indicator}
                  indicator={indicator}
                  measurement={measurement}
                />
              ))}
            </ul>
          </section>

          <section className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {GROWTH_DETAIL_COPY.notesLabel}
            </p>
            <p className="text-sm text-foreground">
              {measurement.note ?? GROWTH_DETAIL_COPY.noNotes}
            </p>
          </section>
        </div>
      ) : null}
    </Modal>
  );
}

function RawMeasurements({
  measurement,
}: {
  readonly measurement: GrowthMeasurementDto;
}) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface-muted/40 p-3 text-sm">
      <RawCell
        label={GROWTH_DETAIL_COPY.weightLabel}
        value={formatNumber(measurement.weightKg, "kg")}
      />
      <RawCell
        label={GROWTH_DETAIL_COPY.heightLabel}
        value={formatNumber(measurement.heightCm, "cm")}
      />
      <RawCell
        label={GROWTH_DETAIL_COPY.headCircumferenceLabel}
        value={formatNumber(measurement.headCircumferenceCm, "cm")}
      />
      <RawCell
        label={GROWTH_DETAIL_COPY.muacLabel}
        value={formatNumber(measurement.muacCm, "cm")}
      />
    </dl>
  );
}

function RawCell({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function IndicatorRow({
  indicator,
  measurement,
}: {
  readonly indicator: GrowthIndicator;
  readonly measurement: GrowthMeasurementDto;
}) {
  const z = measurement.zScores[indicator];
  const sd = measurement.sdClass[indicator] as SdClass | undefined;
  const display = sd ? SD_CLASS_DISPLAY[sd] : undefined;
  const formattedZ =
    typeof z === "number" && Number.isFinite(z)
      ? `${z >= 0 ? "+" : ""}${z.toFixed(2)} SD`
      : "—";
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {GROWTH_INDICATOR_SHORT[indicator]}
        </span>
        <span className="text-xs text-muted-foreground">
          {GROWTH_INDICATOR_LABEL[indicator]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{formattedZ}</span>
        {display ? <Badge tone={display.tone}>{display.label}</Badge> : null}
      </div>
    </li>
  );
}

function formatNumber(value: number | null, unit: string): string {
  if (value === null) return "—";
  return `${value.toFixed(1)} ${unit}`;
}

function formatDateIndo(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
