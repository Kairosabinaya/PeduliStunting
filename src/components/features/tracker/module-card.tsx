import Link from "next/link";
import type { ReactNode } from "react";

import { Activity, Brain, Circle, Syringe, Utensils } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { InfoDialog } from "@/components/primitives/info-dialog";
import { ProgressRing } from "@/components/primitives/progress-ring";
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
        readonly href?: string;
        readonly onClick?: () => void;
      }
    | undefined;
  readonly tone?: ModuleCardTone | undefined;
  readonly disabled?: boolean | undefined;
  readonly progressValue?: number | undefined;
  readonly progressTotal?: number | undefined;
}

/**
 * Per-domain accent dot colour. The card border itself stays uniform
 * (`border-border`) across every tone — mixing solid and opacity-based
 * coloured borders read as inconsistent (tracker UI audit). Domain identity is
 * carried instead by a small colour dot beside the title, which is unambiguous
 * and keeps every card visually equal-weight.
 */
const TONE_ICON: Readonly<Record<ModuleCardTone, React.ElementType>> = {
  default: Circle,
  growth: Activity,
  immunization: Syringe,
  milestone: Brain,
  nutrition: Utensils,
  muted: Circle,
};

const TONE_COLOR: Readonly<Record<ModuleCardTone, string>> = {
  default: "text-muted-foreground",
  growth: "text-tracker-growth",
  immunization: "text-tracker-immunization",
  milestone: "text-tracker-milestone",
  nutrition: "text-tracker-nutrition",
  muted: "text-muted-foreground",
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
  progressValue,
  progressTotal,
}: ModuleCardProps) {
  return (
    <Card
      elevation="sm"
      padding="md"
      className={cn(
        "flex h-full flex-col gap-3 transition-all hover:shadow-md",
        disabled && "opacity-70",
      )}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2.5 text-base">
            {progressValue !== undefined && progressTotal !== undefined ? (
              <ProgressRing
                value={progressValue}
                total={progressTotal}
                size={22}
                strokeWidth={3}
                ariaLabel={title}
                arcColorClass={TONE_COLOR[tone]}
              />
            ) : (
              (() => {
                const Icon = TONE_ICON[tone];
                return (
                  <Icon
                    aria-hidden="true"
                    size={20}
                    className={cn("shrink-0", TONE_COLOR[tone])}
                  />
                );
              })()
            )}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {statusBadge ?? null}
            <InfoDialog title={title} description={description} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-3">
        <p className="text-base font-semibold text-foreground">
          {statusLine ?? "—"}
        </p>
        {cta ? (
          cta.onClick ? (
            <button
              type="button"
              onClick={disabled ? undefined : cta.onClick}
              disabled={disabled}
              className={cn(
                "text-left text-sm font-medium",
                disabled
                  ? "cursor-not-allowed text-muted-foreground"
                  : "text-primary hover:underline",
              )}
            >
              {cta.label}
            </button>
          ) : cta.href ? (
            <Link
              href={disabled ? "#" : cta.href}
              aria-disabled={disabled || undefined}
              scroll={false}
              className={cn(
                "text-sm font-medium",
                disabled
                  ? "pointer-events-none text-muted-foreground"
                  : "text-primary hover:underline",
              )}
            >
              {cta.label}
            </Link>
          ) : null
        ) : null}
      </CardContent>
    </Card>
  );
}
