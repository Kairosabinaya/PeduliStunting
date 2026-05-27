import Link from "next/link";

import { cn } from "@/lib/cn";
import {
  EDUCATION_AGE_PRESETS,
  EDUCATION_COPY,
  EDUCATION_TOPIC_CATALOG,
} from "@/config/education";

import {
  buildEdukasiHref,
  hasActiveEdukasiFilters,
  type ParsedEdukasiFilters,
} from "../_lib/filters";

interface EdukasiFiltersProps {
  readonly filters: ParsedEdukasiFilters;
}

/**
 * Topic and age-band filter chips. Rendered as anchor links so the entire
 * page works without JavaScript and the URL is shareable. Each chip points
 * to the same `/edukasi?...` route with one filter overridden — selecting
 * "Semua" clears that filter only, leaving the others intact.
 */
export function EdukasiFilters({ filters }: EdukasiFiltersProps) {
  const showReset = hasActiveEdukasiFilters(filters);
  return (
    <section
      aria-labelledby="edukasi-filters-heading"
      className="space-y-4 rounded-xl border border-border bg-surface p-4 md:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="edukasi-filters-heading"
          className="text-sm font-semibold text-foreground"
        >
          {EDUCATION_COPY.filtersHeading}
        </h2>
        {showReset ? (
          <Link
            href={buildEdukasiHref(filters, {
              topic: "all",
              agePresetKey: "all",
              search: null,
            })}
            prefetch={false}
            className="text-xs font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {EDUCATION_COPY.resetFiltersLabel}
          </Link>
        ) : null}
      </div>

      <FilterChipGroup
        label={EDUCATION_COPY.topicFilterLabel}
        renderItems={() => (
          <>
            <FilterChip
              href={buildEdukasiHref(filters, { topic: "all" })}
              active={filters.topic === undefined}
              label={EDUCATION_COPY.topicFilterAllLabel}
            />
            {EDUCATION_TOPIC_CATALOG.map((topic) => (
              <FilterChip
                key={topic.key}
                href={buildEdukasiHref(filters, { topic: topic.key })}
                active={filters.topic === topic.key}
                label={topic.label}
                description={topic.description}
              />
            ))}
          </>
        )}
      />

      <FilterChipGroup
        label={EDUCATION_COPY.ageFilterLabel}
        renderItems={() => (
          <>
            <FilterChip
              href={buildEdukasiHref(filters, { agePresetKey: "all" })}
              active={filters.agePresetKey === undefined}
              label={EDUCATION_COPY.ageFilterAllLabel}
            />
            {EDUCATION_AGE_PRESETS.map((preset) => (
              <FilterChip
                key={preset.key}
                href={buildEdukasiHref(filters, { agePresetKey: preset.key })}
                active={filters.agePresetKey === preset.key}
                label={preset.label}
                description={preset.description}
              />
            ))}
          </>
        )}
      />
    </section>
  );
}

interface FilterChipGroupProps {
  readonly label: string;
  readonly renderItems: () => React.ReactNode;
}

function FilterChipGroup({ label, renderItems }: FilterChipGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2" role="list">
        {renderItems()}
      </ul>
    </div>
  );
}

interface FilterChipProps {
  readonly href: string;
  readonly active: boolean;
  readonly label: string;
  readonly description?: string;
}

function FilterChip({ href, active, label, description }: FilterChipProps) {
  return (
    <li>
      <Link
        href={href}
        prefetch={false}
        aria-current={active ? "true" : undefined}
        aria-label={description ? `${label}: ${description}` : label}
        className={cn(
          "inline-flex min-h-11 items-center rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface text-foreground hover:bg-surface-muted",
        )}
      >
        {label}
      </Link>
    </li>
  );
}
