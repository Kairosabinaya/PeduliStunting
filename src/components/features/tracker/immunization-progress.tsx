import { ProgressRing } from "@/components/primitives/progress-ring";
import { IMMUNIZATION_PROGRESS_COPY } from "@/config/tracker";

export interface ImmunizationProgressProps {
  readonly done: number;
  readonly due: number;
}

type LegendKey =
  | "legendDone"
  | "legendUpcoming"
  | "legendMissed"
  | "legendFuture"
  | "legendSkipped";

const LEGEND: ReadonlyArray<{
  readonly key: LegendKey;
  readonly swatchClass: string;
}> = [
  { key: "legendDone", swatchClass: "bg-accent" },
  { key: "legendUpcoming", swatchClass: "bg-brand-200 dark:bg-brand-700" },
  { key: "legendMissed", swatchClass: "bg-ordinal-sedang/40" },
  { key: "legendFuture", swatchClass: "bg-surface-muted border border-border" },
  { key: "legendSkipped", swatchClass: "bg-muted" },
];

/**
 * Header card untuk halaman Imunisasi. Menampilkan progress ring "X dari Y
 * vaksin sesuai usia" + legenda warna timeline supaya orang tua bisa
 * langsung membaca arti dot di bawah.
 */
export function ImmunizationProgress({ done, due }: ImmunizationProgressProps) {
  return (
    <div className="flex flex-wrap items-center gap-5 rounded-xl border border-border bg-surface p-4">
      <ProgressRing
        value={done}
        total={due}
        ariaLabel={IMMUNIZATION_PROGRESS_COPY.ariaLabelFormat(done, due)}
        size={88}
        strokeWidth={9}
        arcColorClass="text-accent"
      >
        <span className="text-2xl font-bold leading-none text-foreground">
          {done}
        </span>
        <span className="text-xs text-muted-foreground">
          {IMMUNIZATION_PROGRESS_COPY.countFormat(done, due)}
        </span>
      </ProgressRing>

      <div className="flex min-w-44 flex-1 flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {IMMUNIZATION_PROGRESS_COPY.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {IMMUNIZATION_PROGRESS_COPY.caption}
        </p>
      </div>

      <ul className="grid w-full gap-1 text-xs text-muted-foreground sm:grid-cols-2 lg:w-auto lg:grid-cols-1">
        {LEGEND.map((entry) => (
          <li key={entry.key} className="flex items-center gap-2">
            <span
              aria-hidden
              className={`inline-block h-2.5 w-2.5 rounded-full ${entry.swatchClass}`}
            />
            <span>{IMMUNIZATION_PROGRESS_COPY[entry.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
