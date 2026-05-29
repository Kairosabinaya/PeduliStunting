import Link from "next/link";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { cn } from "@/lib/cn";

export type ModuleCardTone =
  | "default"
  | "growth"
  | "immunization"
  | "milestone"
  | "nutrition"
  | "muted";

export interface ModuleCardProps {
  readonly title: string;
  readonly description: string;
  readonly statusLine?: string | undefined;
  readonly statusBadge?: ReactNode | undefined;
  readonly cta?:
    | {
        readonly label: string;
        readonly href: string;
      }
    | undefined;
  readonly tone?: ModuleCardTone | undefined;
  readonly disabled?: boolean | undefined;
}

const TONE_BORDER_CLASS: Readonly<Record<ModuleCardTone, string>> = {
  default: "border-border",
  growth: "border-brand-200 dark:border-brand-800",
  immunization: "border-accent/40",
  milestone: "border-primary/30",
  nutrition: "border-warning/40",
  muted: "border-border opacity-70",
};

/**
 * Generic primitive used by the dashboard module grid on
 * `/tracker/anak/[childId]`. Each domain (Pertumbuhan, Imunisasi, Perkembangan,
 * Gizi) renders a `ModuleCard` with its current summary plus a link into the
 * deeper sub-route. Real sparklines / progress rings will be added in
 * Phase 2 once the visual upgrade work begins; for Phase 1 this primitive
 * sticks to legible text + an optional status badge.
 */
export function ModuleCard({
  title,
  description,
  statusLine,
  statusBadge,
  cta,
  tone = "default",
  disabled = false,
}: ModuleCardProps) {
  return (
    <Card
      elevation="sm"
      padding="md"
      className={cn(
        "flex h-full flex-col gap-3 border-2",
        TONE_BORDER_CLASS[tone],
      )}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {statusBadge ?? null}
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        <p className="text-sm text-foreground">{statusLine ?? "—"}</p>
        {cta ? (
          <Link
            href={disabled ? "#" : cta.href}
            aria-disabled={disabled || undefined}
            className={cn(
              "text-sm font-medium",
              disabled
                ? "pointer-events-none text-muted-foreground"
                : "text-primary hover:underline",
            )}
          >
            {cta.label}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
