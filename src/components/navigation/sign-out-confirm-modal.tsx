"use client";

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

interface SignOutConfirmModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/**
 * Controlled confirmation modal for the destructive {@link signOut} action.
 * Shared by every sign-out entry point (the `/account` card, the header avatar
 * menu, and the map bottom sheet) so the confirmation step, copy, and danger
 * styling stay consistent. The caller owns the open state and mounts this at a
 * stable location so the dialog is not torn down mid-confirmation.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <SignOutConfirmModal open={open} onClose={() => setOpen(false)} />
 * ```
 */
export function SignOutConfirmModal({
  open,
  onClose,
}: SignOutConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="centered"
      title={ACCOUNT_SIGN_OUT_COPY.dialogTitle}
      footer={
        <form action={signOut} className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
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
  );
}
