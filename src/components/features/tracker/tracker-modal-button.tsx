"use client";

import { buttonVariants } from "@/components/primitives/button";

import { ModalTrigger } from "./modal-trigger";

export interface TrackerModalButtonProps {
  /** The `?modal=` key this button opens (see `TRACKER_MODAL`). */
  readonly modalKey: string;
  readonly label: string;
  readonly variant?: "primary" | "secondary" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
  readonly ariaLabel?: string;
}

/**
 * A button that opens a `/tracker` modal by setting the `?modal=` param instead
 * of navigating to a separate page. Thin wrapper over {@link ModalTrigger} so
 * "Tambah anak" / "Tambah pengukuran" share one styled trigger.
 *
 * @example
 * ```tsx
 * <TrackerModalButton modalKey={TRACKER_MODAL.addChild} label="Tambah anak" />
 * ```
 */
export function TrackerModalButton({
  modalKey,
  label,
  variant = "primary",
  size = "md",
  ariaLabel,
}: TrackerModalButtonProps) {
  return (
    <ModalTrigger modalKey={modalKey}>
      {({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          className={buttonVariants({ variant, size })}
        >
          {label}
        </button>
      )}
    </ModalTrigger>
  );
}
