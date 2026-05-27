"use client";

import { useActionState, useId, useMemo } from "react";
import { useFormStatus } from "react-dom";

import { upsertChildMilestone } from "@/app/(app)/tracker/anak/[childId]/perkembangan/actions";
import {
  INITIAL_UPSERT_MILESTONE_STATE,
  type UpsertMilestoneFormState,
} from "@/app/(app)/tracker/anak/[childId]/perkembangan/_lib/upsert-milestone-state";

import type {
  ChildMilestoneDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Select } from "@/components/primitives/select";
import { Textarea } from "@/components/primitives/textarea";
import {
  MILESTONE_COPY,
  MILESTONE_DOMAIN_LABEL,
  MILESTONE_STATUS_LABEL,
} from "@/config/tracker";
import {
  CHILD_MILESTONE_STATUSES,
  type ChildMilestoneStatus,
} from "@/domain/health-plan/entities/child-milestone";
import {
  MILESTONE_DOMAINS,
  type MilestoneDomain,
} from "@/domain/health-plan/entities/milestone";

export interface MilestoneChecklistProps {
  readonly childId: string;
  readonly catalog: readonly MilestoneDto[];
  readonly records: readonly ChildMilestoneDto[];
}

function indexByMilestoneId(
  records: readonly ChildMilestoneDto[],
): ReadonlyMap<string, ChildMilestoneDto> {
  const map = new Map<string, ChildMilestoneDto>();
  for (const record of records) {
    map.set(record.milestoneId, record);
  }
  return map;
}

function groupByDomain(
  catalog: readonly MilestoneDto[],
): ReadonlyMap<MilestoneDomain, readonly MilestoneDto[]> {
  const groups = new Map<MilestoneDomain, MilestoneDto[]>();
  for (const domain of MILESTONE_DOMAINS) {
    groups.set(domain, []);
  }
  for (const item of catalog) {
    const bucket = groups.get(item.domain);
    if (!bucket) continue;
    bucket.push(item);
  }
  for (const [domain, items] of groups) {
    items.sort((a, b) => {
      if (a.minAgeMonths !== b.minAgeMonths)
        return a.minAgeMonths - b.minAgeMonths;
      return a.displayOrder - b.displayOrder;
    });
    groups.set(domain, items);
  }
  return groups;
}

function fieldError(
  state: UpsertMilestoneFormState | null,
  field: string,
): string | undefined {
  return state?.fieldErrors?.[field]?.[0];
}

function statusBadgeTone(
  status: ChildMilestoneStatus,
): "neutral" | "success" | "warning" {
  if (status === "achieved") return "success";
  if (status === "delayed") return "warning";
  return "neutral";
}

function RowSubmit() {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      size="sm"
      loading={status.pending}
      disabled={status.pending}
    >
      {status.pending ? MILESTONE_COPY.saving : "Simpan"}
    </Button>
  );
}

function MilestoneRow({
  childId,
  item,
  record,
}: {
  readonly childId: string;
  readonly item: MilestoneDto;
  readonly record: ChildMilestoneDto | undefined;
}) {
  const boundAction = upsertChildMilestone.bind(null, childId, item.id);
  const [state, action] = useActionState<
    UpsertMilestoneFormState | null,
    FormData
  >(boundAction, INITIAL_UPSERT_MILESTONE_STATE);

  const statusId = useId();
  const checkedAtId = useId();
  const noteId = useId();

  const currentStatus =
    state?.record?.status ?? record?.status ?? "not_checked";
  const currentCheckedAt = state?.record?.checkedAt ?? record?.checkedAt ?? "";
  const currentNote = state?.record?.note ?? record?.note ?? "";

  const generalError =
    state && !state.ok ? (state.message ?? MILESTONE_COPY.errorSave) : null;

  const ageRangeLabel = `${item.minAgeMonths}–${item.maxAgeMonths} ${MILESTONE_COPY.ageRangeUnit}`;

  return (
    <li className="space-y-3 rounded-xl border border-border bg-surface p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {item.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge tone="neutral">{ageRangeLabel}</Badge>
            <Badge tone={statusBadgeTone(currentStatus)}>
              {MILESTONE_STATUS_LABEL[currentStatus]}
            </Badge>
            {item.sourceLabel ? <span>{item.sourceLabel}</span> : null}
          </div>
        </div>
      </div>

      <form action={action} className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor={statusId}>{MILESTONE_COPY.statusLabel}</Label>
            <Select
              id={statusId}
              name="status"
              defaultValue={currentStatus}
              errorMessage={fieldError(state, "status")}
            >
              {CHILD_MILESTONE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {MILESTONE_STATUS_LABEL[value]}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={checkedAtId}>{MILESTONE_COPY.checkedAtLabel}</Label>
            <Input
              id={checkedAtId}
              name="checkedAt"
              type="date"
              defaultValue={currentCheckedAt}
              errorMessage={fieldError(state, "checkedAt")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={noteId}>{MILESTONE_COPY.noteLabel}</Label>
            <Textarea
              id={noteId}
              name="note"
              rows={2}
              maxLength={500}
              defaultValue={currentNote}
              errorMessage={fieldError(state, "note")}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {generalError ? (
            <p className="mr-auto text-xs text-danger">{generalError}</p>
          ) : state?.ok ? (
            <p className="mr-auto text-xs text-success">
              {MILESTONE_COPY.saved}
            </p>
          ) : null}
          <RowSubmit />
        </div>
      </form>
    </li>
  );
}

/**
 * Renders the SDIDTK milestone catalog grouped by development domain. Each
 * row mounts its own `useActionState` so a save in one row doesn't reset
 * inputs in another. Per-row action is bound with `childId` and `milestoneId`.
 */
export function MilestoneChecklist({
  childId,
  catalog,
  records,
}: MilestoneChecklistProps) {
  const byMilestoneId = useMemo(() => indexByMilestoneId(records), [records]);
  const groups = useMemo(() => groupByDomain(catalog), [catalog]);

  if (catalog.length === 0) {
    return (
      <EmptyState
        title={MILESTONE_COPY.emptyTitle}
        description={MILESTONE_COPY.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-8">
      {MILESTONE_DOMAINS.map((domain) => {
        const items = groups.get(domain) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={domain} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              {MILESTONE_DOMAIN_LABEL[domain]}
            </h3>
            <ol className="space-y-3">
              {items.map((item) => (
                <MilestoneRow
                  key={item.id}
                  childId={childId}
                  item={item}
                  record={byMilestoneId.get(item.id)}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
