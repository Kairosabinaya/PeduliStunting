import type { ReactNode } from "react";

export interface DashboardSectionProps {
  /** Friendly one-line intro for the section (the tab already names it). */
  readonly description: string;
  readonly children: ReactNode;
}

/**
 * Lightweight intro + content wrapper for a dashboard tab panel. The tab button
 * already names and labels the panel, so this renders only a friendly lead line
 * above the content rather than repeating the title.
 */
export function DashboardSection({
  description,
  children,
}: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children}
    </div>
  );
}
