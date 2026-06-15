"use client";

import Link from "next/link";

import type { ChildDto } from "@/application/tracking/dtos";
import { Badge } from "@/components/primitives/badge";
import { buttonVariants } from "@/components/primitives/button";
import {
  CHILD_DETAIL_COPY,
  SEX_LABEL,
  trackerChildEditRoute,
} from "@/config/tracker";
import { asDateOnly, dateOnlyFromDate } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
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
    <header className="rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-primary">
              {CHILD_DETAIL_COPY.metaTitleSuffix}
            </dt>
            <dd className="break-words text-lg font-semibold text-foreground">
              {child.name}
            </dd>
          </div>
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
            <dd className="text-sm text-foreground">
              {formatBirthDate(child.birthDate)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {CHILD_DETAIL_COPY.ageLabel}
            </dt>
            <dd className="text-sm text-foreground">
              {ageMonths} {CHILD_DETAIL_COPY.ageUnitMonth}
            </dd>
          </div>
        </dl>
        <div className="flex shrink-0 items-center gap-2">
          {/* Link (not a bare ModalTrigger): the edit modal mutates a specific
              child, so the URL must carry `?anak=<id>` alongside `?modal=edit`.
              `trackerChildEditRoute` builds both params; a plain modal trigger
              set only `?modal=edit`, so on the single-child dashboard (no
              `?anak` in the URL) `resolveEditTarget` returned null and the modal
              never opened. `scroll={false}` keeps the dashboard position. */}
          <Link
            href={trackerChildEditRoute(child.id)}
            scroll={false}
            aria-label={CHILD_DETAIL_COPY.editAriaLabel(child.name)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {CHILD_DETAIL_COPY.editLabel}
          </Link>
          <DeleteChildButton childId={child.id} childName={child.name} />
        </div>
      </div>
    </header>
  );
}
