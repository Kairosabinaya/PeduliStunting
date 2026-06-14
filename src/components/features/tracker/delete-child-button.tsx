"use client";

// Client island: holds the open/closed dialog state and drives the
// destructive `softDeleteChild` Server Action via `useActionState`. On success
// it fires an undo toast (Shneiderman rule 6 — easy reversal) and navigates to
// the tracker home; the toast's "Pulihkan" button calls `restoreChild`.

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { restoreChild, softDeleteChild } from "@/app/(app)/tracker/actions";
import {
  INITIAL_DELETE_CHILD_STATE,
  type DeleteChildFormState,
} from "@/app/(app)/tracker/_lib/delete-child-state";
import { Button } from "@/components/primitives/button";
import { FeedbackBanner } from "@/components/primitives/feedback-banner";
import { Modal } from "@/components/primitives/modal";
import { DELETE_CHILD_COPY, TRACKER_ROUTE } from "@/config/tracker";

export interface DeleteChildButtonProps {
  readonly childId: string;
  readonly childName: string;
}

function ConfirmButton() {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      variant="danger"
      size="sm"
      loading={status.pending}
      disabled={status.pending}
    >
      {status.pending ? DELETE_CHILD_COPY.pending : DELETE_CHILD_COPY.confirm}
    </Button>
  );
}

/**
 * Destructive "Hapus anak" trigger plus its confirmation modal. The confirm
 * step guards against accidental deletion (the trigger sits in the child
 * header, close to navigation). On success the Server Action redirects away, so
 * this island only renders the error path inline.
 *
 * @example
 * ```tsx
 * <DeleteChildButton childId={child.id} childName={child.name} />
 * ```
 */
export function DeleteChildButton({
  childId,
  childName,
}: DeleteChildButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<DeleteChildFormState | null, FormData>(
    softDeleteChild,
    INITIAL_DELETE_CHILD_STATE,
  );

  const error =
    state && !state.ok
      ? (state.message ?? DELETE_CHILD_COPY.genericError)
      : null;

  // `useActionState` returns a fresh object per completed call, so this effect
  // re-runs on every successful delete. A ref guards against the toast firing
  // twice for one state (e.g. a re-render that keeps the same state object).
  const handledStateRef = useRef<DeleteChildFormState | null>(null);
  useEffect(() => {
    if (!state || !state.ok || handledStateRef.current === state) return;
    handledStateRef.current = state;
    setOpen(false);
    // Navigate first; the Sonner toaster lives in the root layout and survives
    // the route change, so the "Pulihkan" button stays clickable on /tracker.
    router.push(TRACKER_ROUTE);
    toast.success(DELETE_CHILD_COPY.deletedToast(childName), {
      description: DELETE_CHILD_COPY.deletedToastDescription,
      action: {
        label: DELETE_CHILD_COPY.undoLabel,
        onClick: () => {
          void restoreChild(childId).then((result) => {
            if (result.ok) {
              toast.success(DELETE_CHILD_COPY.restoredToast(childName));
              router.refresh();
            } else {
              toast.error(result.message || DELETE_CHILD_COPY.restoreError);
            }
          });
        },
      },
    });
  }, [state, childId, childName, router]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-danger hover:bg-danger/10"
        aria-label={DELETE_CHILD_COPY.triggerAriaLabel(childName)}
        onClick={() => setOpen(true)}
      >
        {DELETE_CHILD_COPY.trigger}
      </Button>
      <Modal
        open={open}
        onClose={close}
        variant="centered"
        title={DELETE_CHILD_COPY.title}
        description={DELETE_CHILD_COPY.description}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              {DELETE_CHILD_COPY.cancel}
            </Button>
            <form action={action}>
              <input type="hidden" name="childId" value={childId} />
              <ConfirmButton />
            </form>
          </div>
        }
      >
        <div className="space-y-3">
          {error ? <FeedbackBanner tone="error">{error}</FeedbackBanner> : null}
          <p className="text-sm text-muted-foreground">
            {DELETE_CHILD_COPY.confirmBody(childName)}
          </p>
        </div>
      </Modal>
    </>
  );
}
