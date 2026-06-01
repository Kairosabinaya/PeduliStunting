"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TrackerModalProps {
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  readonly variant?: "auto" | "centered" | "sheet";
  readonly className?: string;
  readonly maxWidth?: "md" | "lg" | "xl" | "full";
}

/**
 * A Modal wrapper for the `/tracker` page that is always open when rendered
 * (driven by searchParams) and removes the `?modal=` param when closed,
 * keeping other params like `?anak=` intact. Uses wider max-width to match
 * the main page container.
 */
export function TrackerModal({
  title,
  description,
  children,
  footer,
  variant = "auto",
  maxWidth = "xl",
  className,
}: TrackerModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    const newSearch = params.toString();
    router.push(newSearch ? `?${newSearch}` : "/tracker", { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (!node.open) {
      node.showModal();
    }
  }, []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        handleClose();
      }
    },
    [handleClose],
  );

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      handleClose();
    },
    [handleClose],
  );

  const widthClass = {
    md: "md:w-full md:max-w-3xl",
    lg: "md:w-full md:max-w-5xl",
    xl: "md:w-full md:max-w-7xl",
    full: "md:mx-8 md:w-auto md:max-w-none",
  }[maxWidth];

  const layout =
    variant === "sheet"
      ? "fixed inset-x-0 bottom-0 mt-auto w-full max-w-none rounded-t-2xl rounded-b-none"
      : variant === "centered"
        ? `m-auto ${widthClass} rounded-2xl`
        : `fixed inset-x-0 bottom-0 mt-auto w-full max-w-none rounded-t-2xl rounded-b-none md:static md:m-auto ${widthClass} md:rounded-2xl`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tracker-modal-title"
      aria-describedby={description ? "tracker-modal-description" : undefined}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      className={cn(
        "z-modal border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50",
        layout,
        className,
      )}
    >
      <div className="flex max-h-screen flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="space-y-1">
            <h2 id="tracker-modal-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p
                id="tracker-modal-description"
                className="text-sm text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={handleClose}
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
