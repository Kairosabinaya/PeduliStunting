import type { ReactNode } from "react";

interface PageHeaderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

/**
 * Top-of-page heading used across the `(app)` group. Keeps each route's
 * intro consistent: eyebrow label, large title, supportive copy, optional
 * action slot aligned to the right on `md+`.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
