"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Accessible label for the dialog (read by screen readers). */
  readonly title: string;
  /** Optional description rendered below the title. */
  readonly description?: string;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  /** Adapts to bottom sheet on mobile, centered card on `md+`. Defaults to `auto`. */
  readonly variant?: "auto" | "centered" | "sheet";
  readonly className?: string;
}

/**
 * Accessible modal backed by the native `<dialog>` element. On mobile it
 * adapts to a bottom sheet for thumb reachability; on `md+` it centres in
 * the viewport. Closes on ESC and on backdrop click.
 *
 * @example
 * ```tsx
 * <Modal open={open} onClose={close} title="Tambah pengukuran">
 *   <MeasurementForm />
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "auto",
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onClose();
    },
    [onClose],
  );

  const layout =
    variant === "sheet"
      ? "fixed inset-x-0 bottom-0 mt-auto w-full max-w-none rounded-t-2xl rounded-b-none"
      : variant === "centered"
        ? "m-auto w-[min(100%-2rem,32rem)] rounded-2xl"
        : "fixed inset-x-0 bottom-0 mt-auto w-full max-w-none rounded-t-2xl rounded-b-none md:static md:m-auto md:w-[min(100%-2rem,32rem)] md:rounded-2xl";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      // `z-modal` (1100) sits above the global `z-header` (900) so a
      // fixed-position navbar doesn't peek through the scrim. Native
      // `<dialog>.showModal()` also promotes the element to the top
      // browser layer, but explicit z-index helps for browsers that
      // render dialog as a normal stacking context.
      className={cn(
        "z-modal border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50",
        layout,
        className,
      )}
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="space-y-1">
            <h2 id="modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p
                id="modal-description"
                className="text-sm text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
