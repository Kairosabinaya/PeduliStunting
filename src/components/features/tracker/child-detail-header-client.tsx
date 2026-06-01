"use client";

import type { ChildDto } from "@/application/tracking/dtos";
import { Badge } from "@/components/primitives/badge";
import { buttonVariants } from "@/components/primitives/button";
import { CHILD_DETAIL_COPY, SEX_LABEL } from "@/config/tracker";
import { asDateOnly, dateOnlyFromDate } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import { ModalTrigger } from "./modal-trigger";
import { DeleteChildButton } from "./delete-child-button";

export interface ChildDetailHeaderClientProps {
  readonly child: ChildDto;
}

function formatBirthDate(birthDate: string): string {
  return new Date(birthDate).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function computeAgeMonths(birthDate: string): number {
  const today = dateOnlyFromDate(new Date());
  return monthsBetween(asDateOnly(birthDate), today);
}

/**
 * Client version of ChildDetailHeader that uses modal triggers instead of
 * navigation links. Used on `/tracker` main page.
 */
export function ChildDetailHeaderClient({
  child,
}: ChildDetailHeaderClientProps) {
  const ageMonths = computeAgeMonths(child.birthDate);
  const sexLabel = SEX_LABEL[child.sex];

  return (
    <header className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {CHILD_DETAIL_COPY.metaTitleSuffix}
          </p>
          <h1 className="break-words text-2xl font-semibold text-foreground md:text-3xl">
            {child.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ModalTrigger modalKey="edit">
            {({ onClick }) => (
              <button
                type="button"
                onClick={onClick}
                aria-label={CHILD_DETAIL_COPY.editAriaLabel(child.name)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {CHILD_DETAIL_COPY.editLabel}
              </button>
            )}
          </ModalTrigger>
          <DeleteChildButton childId={child.id} childName={child.name} />
        </div>
      </div>
      <dl className="grid gap-3 text-sm md:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {CHILD_DETAIL_COPY.sexLabel}
          </dt>
          <dd>
            <Badge tone="primary">{sexLabel}</Badge>
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {CHILD_DETAIL_COPY.birthDateLabel}
          </dt>
          <dd className="text-foreground">
            {formatBirthDate(child.birthDate)}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {CHILD_DETAIL_COPY.ageLabel}
          </dt>
          <dd className="text-foreground">
            {ageMonths} {CHILD_DETAIL_COPY.ageUnitMonth}
          </dd>
        </div>
      </dl>
    </header>
  );
}
