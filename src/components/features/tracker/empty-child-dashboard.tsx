import { MODULE_CARD_COPY } from "@/config/tracker";

import { ModuleCard, type ModuleCardTone } from "./module-card";

interface EmptyModule {
  readonly key: keyof typeof MODULE_CARD_COPY;
  readonly tone: ModuleCardTone;
}

const EMPTY_MODULES: readonly EmptyModule[] = [
  { key: "growth", tone: "growth" },
  { key: "immunization", tone: "immunization" },
  { key: "milestone", tone: "milestone" },
] as const;

/**
 * The dashboard "frame" shown when the account has no children yet: the four
 * core modules rendered disabled with their empty-status copy, so a first
 * visit already shows what the tracker will track once a child is added. Pair
 * it with the `EmptyState` "Tambah anak" call to action above.
 *
 * @example
 * ```tsx
 * <EmptyState title="Belum ada anak" action={addChildCta} />
 * <EmptyChildDashboard />
 * ```
 */
export function EmptyChildDashboard() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {EMPTY_MODULES.map(({ key, tone }) => {
        const copy = MODULE_CARD_COPY[key];
        return (
          <ModuleCard
            key={key}
            title={copy.title}
            description={copy.description}
            statusLine={copy.emptyStatus}
            tone={tone}
            disabled
          />
        );
      })}
    </div>
  );
}
