/** MapLegend — gradient color legend for stunting prevalence, overlaid on map corner. */
import { getStuntingGradientColor } from "@/lib/stunting-color";

/** Gradient preview: generate CSS from sampled color stops */
const GRADIENT_CSS = (() => {
  const steps = [0, 10, 20, 25, 30, 35, 45];
  const stops = steps.map(
    (rate, i) =>
      `${getStuntingGradientColor(rate)} ${Math.round((i / (steps.length - 1)) * 100)}%`
  );
  return `linear-gradient(to right, ${stops.join(", ")})`;
})();

export function MapLegend() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100">
      <p className="text-xs font-semibold text-foreground/70 mb-2">
        Prevalensi Stunting
      </p>

      {/* Gradient bar */}
      <div
        className="h-2.5 rounded-full w-40"
        style={{ background: GRADIENT_CSS }}
      />

      {/* Labels */}
      <div className="flex justify-between mt-1.5 text-[10px] text-foreground/50">
        <span>0%</span>
        <span>20%</span>
        <span>30%</span>
        <span>45%+</span>
      </div>

      {/* Category labels */}
      <div className="flex justify-between mt-0.5 text-[10px] font-medium text-foreground/60">
        <span>Rendah</span>
        <span>Sedang</span>
        <span>Tinggi</span>
      </div>
    </div>
  );
}
