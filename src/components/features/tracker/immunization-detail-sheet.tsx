"use client";

import { useActionState, useId, useRef, useTransition } from "react";

import { upsertChildImmunization } from "@/app/(app)/tracker/anak/[childId]/imunisasi/actions";
import {
  INITIAL_UPSERT_IMMUNIZATION_STATE,
  type UpsertImmunizationFormState,
} from "@/app/(app)/tracker/anak/[childId]/imunisasi/_lib/upsert-immunization-state";
import type {
  ChildImmunizationDto,
  ImmunizationDto,
} from "@/application/health-plan/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Modal } from "@/components/primitives/modal";
import { Textarea } from "@/components/primitives/textarea";
import {
  IMMUNIZATION_CELL_COPY,
  IMMUNIZATION_DETAIL_COPY,
  IMMUNIZATION_STATUS_LABEL,
  TRACKER_FIELD_LIMITS,
} from "@/config/tracker";
import type { ChildImmunizationStatus } from "@/domain/health-plan/entities/child-immunization";
import { todayIso } from "@/lib/today";

import { applyImmunizationStatus } from "./immunization-quick-action";

export interface ImmunizationDetailSheetProps {
  readonly childId: string;
  readonly childBirthDate: string;
  readonly item: ImmunizationDto | null;
  readonly record: ChildImmunizationDto | null;
  readonly onClose: () => void;
}

/**
 * Detail sheet (Modal `auto` variant — bottom sheet di mobile, centered di
 * desktop) yang tampil saat user mengetuk sel timeline imunisasi.
 *
 * Konten:
 *   - Nama + dosis + rekomendasi usia
 *   - Status terkini (badge)
 *   - "Vaksin ini mencegah" — dari kolom `prevents` Buku KIA (seed Phase 0)
 *   - Quick action: tombol "Tandai sudah diberikan" + date input + catatan
 *
 * Quick action memakai Server Action existing `upsertChildImmunization`
 * (di-bind dengan childId + immunizationCode) tanpa duplikasi logika.
 */
export function ImmunizationDetailSheet({
  childId,
  childBirthDate,
  item,
  record,
  onClose,
}: ImmunizationDetailSheetProps) {
  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title={item ? item.name : IMMUNIZATION_DETAIL_COPY.closeLabel}
    >
      {item ? (
        <SheetBody
          childId={childId}
          childBirthDate={childBirthDate}
          item={item}
          record={record}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

function SheetBody({
  childId,
  childBirthDate,
  item,
  record,
  onClose,
}: {
  readonly childId: string;
  readonly childBirthDate: string;
  readonly item: ImmunizationDto;
  readonly record: ChildImmunizationDto | null;
  readonly onClose: () => void;
}) {
  const boundAction = upsertChildImmunization.bind(null, childId, item.code);
  const [state, action, pending] = useActionState<
    UpsertImmunizationFormState | null,
    FormData
  >(boundAction, INITIAL_UPSERT_IMMUNIZATION_STATE);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);

  const givenAtId = useId();
  const noteId = useId();

  const currentStatus: ChildImmunizationStatus =
    state?.record?.status ?? record?.status ?? "pending";
  const currentGivenAt = state?.record?.givenAt ?? record?.givenAt ?? "";
  const currentNote = state?.record?.note ?? record?.note ?? "";
  const statusTone =
    IMMUNIZATION_CELL_COPY[
      currentStatus === "done"
        ? "done"
        : currentStatus === "skipped"
          ? "skipped"
          : "future"
    ].tone;
  const today = todayIso();

  function submitWithStatus(nextStatus: ChildImmunizationStatus) {
    const form = formRef.current
      ? new FormData(formRef.current)
      : new FormData();
    applyImmunizationStatus(form, { childBirthDate, nextStatus, today });
    startTransition(() => {
      action(form);
    });
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {item.doseNumber !== null ? (
            <Badge tone="neutral">
              {IMMUNIZATION_DETAIL_COPY.doseLabel} {item.doseNumber}
            </Badge>
          ) : null}
          {item.recommendedAgeMonths !== null ? (
            <span>
              {IMMUNIZATION_DETAIL_COPY.ageLabel}: {item.recommendedAgeMonths}{" "}
              {IMMUNIZATION_DETAIL_COPY.ageUnit}
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {IMMUNIZATION_DETAIL_COPY.statusHeading}
          </p>
          <Badge tone={statusTone}>
            {IMMUNIZATION_STATUS_LABEL[currentStatus]}
          </Badge>
        </div>
      </header>

      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {IMMUNIZATION_DETAIL_COPY.preventsHeading}
        </p>
        <p className="text-sm text-foreground">
          {item.prevents ?? IMMUNIZATION_DETAIL_COPY.preventsFallback}
        </p>
      </section>

      {item.notes ? (
        <section className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {IMMUNIZATION_DETAIL_COPY.notesHeading}
          </p>
          <p className="text-sm text-muted-foreground">{item.notes}</p>
        </section>
      ) : null}

      <form
        ref={formRef}
        action={action}
        className="space-y-3 rounded-lg border border-border bg-surface-muted/30 p-3"
      >
        <input type="hidden" name="status" value={currentStatus} />
        <input type="hidden" name="childBirthDate" value={childBirthDate} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={givenAtId}>
              {IMMUNIZATION_DETAIL_COPY.givenAtLabel}
            </Label>
            <Input
              id={givenAtId}
              name="givenAt"
              type="date"
              min={childBirthDate}
              max={today}
              defaultValue={currentGivenAt}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={noteId}>
              {IMMUNIZATION_DETAIL_COPY.ownNoteLabel}
            </Label>
            <Textarea
              id={noteId}
              name="note"
              rows={2}
              maxLength={TRACKER_FIELD_LIMITS.noteMaxLength}
              defaultValue={currentNote}
            />
          </div>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={currentStatus === "done" ? "secondary" : "primary"}
          size="sm"
          onClick={() => submitWithStatus("done")}
          loading={pending}
          disabled={pending}
        >
          {pending
            ? IMMUNIZATION_DETAIL_COPY.saving
            : IMMUNIZATION_DETAIL_COPY.markDoneCta}
        </Button>
        {currentStatus !== "pending" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => submitWithStatus("pending")}
            disabled={pending}
          >
            {IMMUNIZATION_DETAIL_COPY.markPendingCta}
          </Button>
        ) : null}
        {currentStatus !== "skipped" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => submitWithStatus("skipped")}
            disabled={pending}
          >
            {IMMUNIZATION_DETAIL_COPY.markSkippedCta}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={pending}
          className="ml-auto"
        >
          {IMMUNIZATION_DETAIL_COPY.closeLabel}
        </Button>
      </div>

      {state?.ok && state.record ? (
        <FeedbackBanner tone="success">
          {IMMUNIZATION_DETAIL_COPY.savedMessage}
        </FeedbackBanner>
      ) : null}
      {state && !state.ok && state.message ? (
        <FeedbackBanner tone="error">{state.message}</FeedbackBanner>
      ) : null}
    </div>
  );
}
