/** MapLegend — color legend for stunting categories, overlaid on map corner. */
import { STUNTING_COLORS } from "@/lib/constants";

const CATEGORIES = [
  { key: "Rendah", label: "Rendah" },
  { key: "Sedang", label: "Sedang" },
  { key: "Tinggi", label: "Tinggi" },
] as const;

export function MapLegend() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
      <p className="text-xs font-semibold text-foreground/70 mb-2">
        Kategori Stunting
      </p>
      <div className="space-y-1.5">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-sm shrink-0"
              style={{ backgroundColor: STUNTING_COLORS[key] }}
            />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
