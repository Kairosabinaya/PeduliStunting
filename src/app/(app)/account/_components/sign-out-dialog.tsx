"use client";

import { useState } from "react";

import { Button } from "@/components/primitives/button";
import { SignOutConfirmModal } from "@/components/navigation/sign-out-confirm-modal";
import { ACCOUNT_SIGN_OUT_COPY } from "@/config/account";

/**
 * Danger-styled trigger + confirmation modal for signing out from `/account`.
 * The confirmation step prevents accidental sign-outs (especially on mobile
 * where the trigger sits close to other footer controls). The modal itself is
 * the shared {@link SignOutConfirmModal} so every sign-out surface behaves the
 * same.
 */
export function SignOutDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setOpen(true)}>
        {ACCOUNT_SIGN_OUT_COPY.triggerLabel}
      </Button>
      <SignOutConfirmModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
