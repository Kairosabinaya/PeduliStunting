"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/primitives/button";
import { Modal } from "@/components/primitives/modal";
import { ACCOUNT_SIGN_OUT_COPY } from "@/config/account";

function ConfirmSignOutButton() {
  const status = useFormStatus();
  return (
    <Button type="submit" variant="danger" loading={status.pending}>
      {ACCOUNT_SIGN_OUT_COPY.confirmLabel}
    </Button>
  );
}

/**
 * Trigger + confirmation modal for the destructive {@link signOut} action.
 * The confirmation step prevents accidental sign-outs (especially on mobile
 * where the trigger sits close to other footer controls).
 */
export function SignOutDialog() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        {ACCOUNT_SIGN_OUT_COPY.triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={close}
        variant="centered"
        title={ACCOUNT_SIGN_OUT_COPY.dialogTitle}
        description={ACCOUNT_SIGN_OUT_COPY.dialogDescription}
        footer={
          <form action={signOut} className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" onClick={close}>
              {ACCOUNT_SIGN_OUT_COPY.cancelLabel}
            </Button>
            <ConfirmSignOutButton />
          </form>
        }
      >
        <p className="text-sm text-muted-foreground">
          {ACCOUNT_SIGN_OUT_COPY.dialogDescription}
        </p>
      </Modal>
    </>
  );
}
