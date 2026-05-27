import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short headline explaining why the list/section is empty. */
  readonly title: string;
  /** What the user can do next (filter change, create item, learn more). */
  readonly description: string;
  /** Primary call-to-action. */
  readonly action?: ReactNode;
  /** Secondary call-to-action (e.g., "Pelajari lebih lanjut"). */
  readonly secondaryAction?: ReactNode;
  /** Optional illustration / icon node rendered above the title. */
  readonly icon?: ReactNode;
}

/**
 * Required wrapper for any list/section that may be empty. Always explains
 * *why* it is empty AND offers a next step. See project guidelines §11.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="Belum ada anak terdaftar"
 *   description="Tambahkan profil anak untuk mulai memantau pertumbuhan."
 *   action={<Button>Tambah anak</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface p-6 text-center md:p-10",
        className,
      )}
      {...rest}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      {action || secondaryAction ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
