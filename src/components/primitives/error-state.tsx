import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short headline (Bahasa Indonesia). */
  readonly title: string;
  /** Plain-language explanation of what happened and what the user can do. */
  readonly description: string;
  /** Primary recovery action (retry, contact, navigate). */
  readonly action?: ReactNode;
  /** Optional support correlation ID for the user to quote when reporting. */
  readonly correlationId?: string;
  /** Optional icon node rendered above the title. */
  readonly icon?: ReactNode;
}

/**
 * Required wrapper for any data-fetch failure. Internal details (stacks,
 * payloads) go to Sentry — the user sees only the friendly message plus the
 * correlation ID. See project guidelines §11 and §12.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="Tidak bisa memuat data"
 *   description="Periksa koneksi internet Anda lalu coba lagi."
 *   action={<Button onClick={retry}>Coba lagi</Button>}
 * />
 * ```
 */
export function ErrorState({
  title,
  description,
  action,
  correlationId,
  icon,
  className,
  ...rest
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-6 text-center md:p-10",
        className,
      )}
      {...rest}
    >
      {icon ? <div className="text-danger">{icon}</div> : null}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
      {correlationId ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Kode rujukan: <span className="font-mono">{correlationId}</span>
        </p>
      ) : null}
    </div>
  );
}
