"use client";

import {
  useActionState,
  useId,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  Brush,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  MessageCircle,
  PersonStanding,
} from "lucide-react";

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
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Textarea } from "@/components/primitives/textarea";
import { cn } from "@/lib/cn";
import {
  MILESTONE_CARD_COPY,
  MILESTONE_COPY,
  MILESTONE_DOMAIN_LABEL,
  MILESTONE_STATUS_LABEL,
  TRACKER_FIELD_LIMITS,
} from "@/config/tracker";
import type { ChildMilestoneStatus } from "@/domain/health-plan/entities/child-milestone";
import type { MilestoneDomain } from "@/domain/health-plan/entities/milestone";
import { todayIso } from "@/lib/today";

import { MilestoneStimulationPanel } from "./milestone-stimulation-panel";

const DOMAIN_ICON_MAP: Record<MilestoneDomain, typeof PersonStanding> = {
  gross_motor: PersonStanding,
  fine_motor: Brush,
  language: MessageCircle,
  social: HeartHandshake,
};

const STATUS_BADGE_TONE: Record<
  ChildMilestoneStatus,
  "neutral" | "success" | "warning"
> = {
  achieved: "success",
  delayed: "warning",
  not_checked: "neutral",
};

export interface MilestoneCardProps {
  readonly childId: string;
  readonly childBirthDate: string;
  readonly milestone: MilestoneDto;
  readonly record: ChildMilestoneDto | undefined;
}

/**
 * Kartu tunggal untuk satu milestone SDIDTK. Menggantikan list polos di
 * `MilestoneChecklist` lama.
 *
 * Komposisi:
 *   - Header: ikon domain (Lucide) + label rentang usia + status badge
 *   - Deskripsi tonggak
 *   - Tiga tombol cepat: Tercapai / Belum tercapai / Reset
 *   - Section "Catatan & tanggal" collapsible (form tetap pakai
 *     `upsertChildMilestone` action existing)
 *   - Panel stimulasi otomatis muncul saat status = `delayed`
 */
export function MilestoneCard({
  childId,
  childBirthDate,
  milestone,
  record,
}: MilestoneCardProps) {
  const boundAction = upsertChildMilestone.bind(null, childId, milestone.id);
  const [state, action, pending] = useActionState<
    UpsertMilestoneFormState | null,
    FormData
  >(boundAction, INITIAL_UPSERT_MILESTONE_STATE);
  const [, startTransition] = useTransition();
  const [noteExpanded, setNoteExpanded] = useState(false);

  const checkedAtId = useId();
  const noteId = useId();

  const currentStatus: ChildMilestoneStatus =
    state?.record?.status ?? record?.status ?? "not_checked";
  const currentCheckedAt = state?.record?.checkedAt ?? record?.checkedAt ?? "";
  const currentNote = state?.record?.note ?? record?.note ?? "";
  const today = todayIso();

  const DomainIcon = DOMAIN_ICON_MAP[milestone.domain];

  function submitWithStatus(nextStatus: ChildMilestoneStatus) {
    const form = new FormData();
    form.set("childBirthDate", childBirthDate);
    form.set("status", nextStatus);
    if (nextStatus === "achieved") {
      form.set("checkedAt", currentCheckedAt || today);
    } else if (nextStatus === "delayed") {
      form.set("checkedAt", currentCheckedAt || today);
    } else {
      form.set("checkedAt", "");
    }
    form.set("note", currentNote);
    startTransition(() => {
      action(form);
    });
  }

  const ageBadge = MILESTONE_CARD_COPY.ageRangeFormat(
    milestone.minAgeMonths,
    milestone.maxAgeMonths,
  );

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-surface p-4 transition-shadow",
        currentStatus === "delayed"
          ? "border-warning/40"
          : currentStatus === "achieved"
            ? "border-accent/40"
            : "border-border",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary"
          >
            <DomainIcon size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {MILESTONE_DOMAIN_LABEL[milestone.domain]}
            </span>
            <Badge tone="neutral" className="mt-1">
              {ageBadge}
            </Badge>
          </div>
        </div>
        <Badge tone={STATUS_BADGE_TONE[currentStatus]}>
          {MILESTONE_STATUS_LABEL[currentStatus]}
        </Badge>
      </header>

      <p className="text-sm text-foreground">{milestone.description}</p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={currentStatus === "achieved" ? "secondary" : "primary"}
          size="sm"
          onClick={() => submitWithStatus("achieved")}
          disabled={pending}
        >
          {pending
            ? MILESTONE_CARD_COPY.saving
            : MILESTONE_CARD_COPY.achievedCta}
        </Button>
        <Button
          type="button"
          variant={currentStatus === "delayed" ? "secondary" : "outline"}
          size="sm"
          onClick={() => submitWithStatus("delayed")}
          disabled={pending}
        >
          {MILESTONE_CARD_COPY.delayedCta}
        </Button>
        {currentStatus !== "not_checked" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => submitWithStatus("not_checked")}
            disabled={pending}
          >
            {MILESTONE_CARD_COPY.resetCta}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setNoteExpanded((open) => !open)}
          aria-expanded={noteExpanded}
          className="ml-auto"
        >
          {noteExpanded ? (
            <ChevronUp size={14} aria-hidden />
          ) : (
            <ChevronDown size={14} aria-hidden />
          )}
          <span className="ml-1 text-xs">
            {noteExpanded
              ? MILESTONE_CARD_COPY.collapseNote
              : MILESTONE_CARD_COPY.expandNote}
          </span>
        </Button>
      </div>

      {noteExpanded ? (
        <form
          action={action}
          className="grid gap-3 rounded-lg border border-border bg-surface-muted/30 p-3 md:grid-cols-2"
        >
          <input type="hidden" name="status" value={currentStatus} />
          <input type="hidden" name="childBirthDate" value={childBirthDate} />
          <div className="space-y-1">
            <Label htmlFor={checkedAtId}>{MILESTONE_COPY.checkedAtLabel}</Label>
            <Input
              id={checkedAtId}
              name="checkedAt"
              type="date"
              min={childBirthDate}
              max={today}
              defaultValue={currentCheckedAt}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={noteId}>{MILESTONE_COPY.noteLabel}</Label>
            <Textarea
              id={noteId}
              name="note"
              rows={2}
              maxLength={TRACKER_FIELD_LIMITS.noteMaxLength}
              defaultValue={currentNote}
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={pending}
            disabled={pending}
            className="md:col-span-2 md:w-fit"
          >
            {pending ? MILESTONE_COPY.saving : MILESTONE_CARD_COPY.saveNoteCta}
          </Button>
        </form>
      ) : null}

      {currentStatus === "delayed" ? (
        <MilestoneStimulationPanel
          minAgeMonths={milestone.minAgeMonths}
          maxAgeMonths={milestone.maxAgeMonths}
        />
      ) : null}

      <FeedbackArea state={state} />
    </article>
  );
}

function FeedbackArea({
  state,
}: {
  readonly state: UpsertMilestoneFormState | null;
}): ReactNode {
  if (!state) return null;
  if (!state.ok && state.message) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
      >
        {state.message}
      </p>
    );
  }
  return null;
}
