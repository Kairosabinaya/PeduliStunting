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

/**
 * Per-domain accent dot colour. The card border itself stays uniform
 * (`border-border`) across every tone — mixing solid and opacity-based
 * coloured borders read as inconsistent (tracker UI audit). Domain identity is
 * carried instead by a small colour dot beside the title, which is unambiguous
 * and keeps every card visually equal-weight.
 */
const TONE_DOT_CLASS: Readonly<Record<ModuleCardTone, string>> = {
  default: "bg-muted-foreground",
  growth: "bg-primary",
  immunization: "bg-accent",
  milestone: "bg-warning",
  nutrition: "bg-success",
  muted: "bg-muted-foreground",
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
      className={cn("flex h-full flex-col gap-3", disabled && "opacity-70")}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span
              aria-hidden="true"
              className={cn(
                "inline-block h-2 w-2 shrink-0 rounded-full",
                TONE_DOT_CLASS[tone],
              )}
            />
            {title}
          </CardTitle>
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
