import { Badge } from "@/components/primitives/badge";
import { SD_CLASS_DISPLAY } from "@/config/tracker";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";

export interface SdClassBadgeProps {
  readonly sdClass: SdClass;
  readonly className?: string;
}

/**
 * Coloured pill mapping a Buku KIA SD classification (e.g. `pendek`,
 * `obesitas`) to its localised label and semantic tone. Centralises the
 * mapping so every surface (summary card, history row, chart legend) renders
 * the same colour for the same category.
 *
 * @example
 * ```tsx
 * <SdClassBadge sdClass="pendek" />
 * ```
 */
export function SdClassBadge({ sdClass, className }: SdClassBadgeProps) {
  const display = SD_CLASS_DISPLAY[sdClass];
  return (
    <Badge tone={display.tone} className={className}>
      {display.label}
    </Badge>
  );
}
