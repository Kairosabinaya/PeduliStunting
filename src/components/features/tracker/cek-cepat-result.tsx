"use client";

import Link from "next/link";

import { Badge } from "@/components/primitives/badge";
import { buttonVariants } from "@/components/primitives/button";
import {
  CEK_CEPAT_COPY,
  CEK_CEPAT_INDICATOR_SHORT,
  CEK_CEPAT_STATUS_COPY,
  type CekCepatTone,
} from "@/config/cek-cepat";
import { TRACKER_NEW_CHILD_ROUTE } from "@/config/tracker";
import { LANDING_ROUTE } from "@/config/app";
import type {
  QuickScreeningIndicatorDto,
  QuickScreeningResultDto,
} from "@/application/tracking/use-cases/compute-quick-screening";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

export interface CekCepatResultProps {
  readonly result: QuickScreeningResultDto;
}

/**
 * Render the screening result returned by `POST /api/tracker/cek-cepat`.
 * The TB/U (stunting) outcome is the headline; BB/U and BB/TB appear as
 * smaller supporting pills below. A persistent disclaimer reminds the user
 * that this is screening, not diagnosis.
 */
export function CekCepatResult({ result }: CekCepatResultProps) {
  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {CEK_CEPAT_COPY.result.stuntingLabel}
        </p>
        {result.stunting ? (
          <StuntingHeadline outcome={result.stunting} />
        ) : (
          <p className="text-sm text-muted-foreground">
            {CEK_CEPAT_COPY.result.stuntingFallback}
          </p>
        )}
      </section>

      {result.supporting.length > 0 ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {CEK_CEPAT_COPY.result.supportingLabel}
          </p>
          <ul className="flex flex-wrap gap-2">
            {result.supporting.map((outcome) => (
              <SupportingPill key={outcome.indicator} outcome={outcome} />
            ))}
          </ul>
        </section>
      ) : null}

      {result.missingStandards ? (
        <section
          className="rounded-md border border-warning/40 bg-warning/10 p-3"
          role="alert"
        >
          <p className="text-sm font-semibold text-foreground">
            {CEK_CEPAT_COPY.result.missingStandardsTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {CEK_CEPAT_COPY.result.missingStandardsBody}
          </p>
        </section>
      ) : null}

      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {CEK_CEPAT_COPY.result.disclaimerTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {CEK_CEPAT_COPY.result.disclaimerBody}
        </p>
      </section>

      <div className="flex flex-col gap-2 pt-1">
        <Link
          href={TRACKER_NEW_CHILD_ROUTE}
          className={buttonVariants({
            variant: "primary",
            size: "sm",
            fullWidth: true,
          })}
        >
          {CEK_CEPAT_COPY.buttons.createChild}
        </Link>
        <Link
          href={LANDING_ROUTE}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            fullWidth: true,
          })}
        >
          {CEK_CEPAT_COPY.buttons.learnMore}
        </Link>
      </div>
    </div>
  );
}

function StuntingHeadline({
  outcome,
}: {
  readonly outcome: QuickScreeningIndicatorDto;
}) {
  const copy = CEK_CEPAT_STATUS_COPY[outcome.sdClass as SdClass];
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span
          className={headlineToneClasses(copy.tone)}
          aria-label={`${CEK_CEPAT_COPY.result.stuntingLabel}: ${copy.label}`}
        >
          {copy.label}
        </span>
        <span className="text-xs text-muted-foreground">
          z = {formatZ(outcome.zScore)} SD
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{copy.interpretation}</p>
    </div>
  );
}

function SupportingPill({
  outcome,
}: {
  readonly outcome: QuickScreeningIndicatorDto;
}) {
  const copy = CEK_CEPAT_STATUS_COPY[outcome.sdClass as SdClass];
  return (
    <li>
      <Badge tone={toBadgeTone(copy.tone)} className="gap-1">
        <span className="text-[10px] font-bold uppercase opacity-80">
          {CEK_CEPAT_INDICATOR_SHORT[outcome.indicator]}
        </span>
        <span>{copy.label}</span>
        <span className="opacity-60">({formatZ(outcome.zScore)})</span>
      </Badge>
    </li>
  );
}

function headlineToneClasses(tone: CekCepatTone): string {
  const base = "text-2xl font-bold leading-tight";
  switch (tone) {
    case "success":
      return `${base} text-accent-foreground`;
    case "warning":
      return `${base} text-ordinal-sedang`;
    case "danger":
      return `${base} text-ordinal-tinggi`;
    case "primary":
      return `${base} text-primary`;
    default:
      return `${base} text-foreground`;
  }
}

function toBadgeTone(
  tone: CekCepatTone,
): "neutral" | "primary" | "success" | "warning" | "danger" {
  switch (tone) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "danger":
      return "danger";
    case "primary":
      return "primary";
    default:
      return "neutral";
  }
}

function formatZ(value: number): string {
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}
