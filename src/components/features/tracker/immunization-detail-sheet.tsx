"use client";

import { useActionState, useId, useTransition } from "react";

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
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import { Modal } from "@/components/primitives/modal";
import { Textarea } from "@/components/primitives/textarea";
import {
  IMMUNIZATION_CELL_COPY,
  IMMUNIZATION_DETAIL_COPY,
  IMMUNIZATION_STATUS_LABEL,
} from "@/config/tracker";
import type { ChildImmunizationStatus } from "@/domain/health-plan/entities/child-immunization";

export interface ImmunizationDetailSheetProps {
  readonly childId: string;
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
  item,
  record,
  onClose,
}: {
  readonly childId: string;
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

  function submitWithStatus(nextStatus: ChildImmunizationStatus) {
    const form = new FormData();
    form.set("status", nextStatus);
    if (nextStatus === "done") {
      const value = currentGivenAt || todayIso();
      form.set("givenAt", value);
    } else {
      form.set("givenAt", "");
    }
    form.set("note", currentNote);
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
        action={action}
        className="space-y-3 rounded-lg border border-border bg-surface-muted/30 p-3"
      >
        <input type="hidden" name="status" value={currentStatus} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={givenAtId}>
              {IMMUNIZATION_DETAIL_COPY.givenAtLabel}
            </Label>
            <Input
              id={givenAtId}
              name="givenAt"
              type="date"
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
              maxLength={500}
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

      {state && !state.ok && state.message ? (
        <p
          className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
