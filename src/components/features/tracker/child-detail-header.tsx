import Link from "next/link";

import type { ChildDto } from "@/application/tracking/dtos";
import { Badge } from "@/components/primitives/badge";
import { buttonVariants } from "@/components/primitives/button";
import {
  CHILD_DETAIL_COPY,
  SEX_LABEL,
  TRACKER_ROUTE,
  trackerChildEditRoute,
} from "@/config/tracker";
import { asDateOnly, dateOnlyFromDate } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";

import { DeleteChildButton } from "./delete-child-button";

export interface ChildDetailHeaderProps {
  readonly child: ChildDto;
  /**
   * Whether to render the "back to all children" link. Shown on the nested
   * child route (a drill-down) and hidden on the `/tracker` dashboard, which
   * already lists every child via the switcher.
   */
  readonly showBackLink?: boolean;
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
 * Top-of-page summary for a single child. Renders a "back to list" link plus
 * the child's name, sex, birth date, and current age in completed months — the
 * same denominator the WHO LMS standards use, so the age shown here matches the
 * chart x-axis. The back link gives a clear way out of the nested child route.
 */
export function ChildDetailHeader({
  child,
  showBackLink = true,
}: ChildDetailHeaderProps) {
  const ageMonths = computeAgeMonths(child.birthDate);
  const sexLabel = SEX_LABEL[child.sex];

  return (
    <header className="space-y-4 rounded-xl border border-border bg-surface p-5 md:p-6">
      {showBackLink ? (
        <Link
          href={TRACKER_ROUTE}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true">←</span>
          {CHILD_DETAIL_COPY.backToList}
        </Link>
      ) : null}
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
          <Link
            href={trackerChildEditRoute(child.id)}
            aria-label={CHILD_DETAIL_COPY.editAriaLabel(child.name)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {CHILD_DETAIL_COPY.editLabel}
          </Link>
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
