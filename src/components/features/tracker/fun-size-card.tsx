import { FUN_SIZE_COPY } from "@/config/tracker";
import { findHeightComparison, findWeightComparison } from "@/config/fun-size";
import type { GrowthMeasurementDto } from "@/application/tracking/dtos";

export interface FunSizeCardProps {
  readonly latest: GrowthMeasurementDto | null;
}

/**
 * Kartu kecil di samping kurva yang menerjemahkan angka berat & tinggi anak
 * menjadi perbandingan visual yang relatable bagi orang tua. Murni
 * dekoratif — tidak ada keputusan medis di sini.
 */
export function FunSizeCard({ latest }: FunSizeCardProps) {
  const weightComparison = findWeightComparison(latest?.weightKg ?? null);
  const heightComparison = findHeightComparison(latest?.heightCm ?? null);
  const hasAnything = weightComparison !== null || heightComparison !== null;

  return (
    <aside className="rounded-xl border border-border bg-surface-muted/40 p-5">
      <p className="text-sm font-semibold text-foreground">
        {FUN_SIZE_COPY.title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {FUN_SIZE_COPY.description}
      </p>
      {!hasAnything || !latest ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {FUN_SIZE_COPY.emptyState}
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-sm text-foreground">
          {weightComparison && latest.weightKg !== null ? (
            <li>
              {FUN_SIZE_COPY.weightFormat(
                latest.weightKg,
                weightComparison.label,
              )}
            </li>
          ) : null}
          {heightComparison && latest.heightCm !== null ? (
            <li>
              {FUN_SIZE_COPY.heightFormat(
                latest.heightCm,
                heightComparison.label,
              )}
            </li>
          ) : null}
        </ul>
      )}
    </aside>
  );
}
