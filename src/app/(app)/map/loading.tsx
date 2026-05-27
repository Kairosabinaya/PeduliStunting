/**
 * Minimal loading state for `/map`. The previous skeleton mirrored the legacy
 * 2-column grid which now leaks visually behind the fullscreen MapLibre
 * canvas during route transitions (per Claude-in-Chrome review).
 *
 * Replace with: a fullscreen background + a thin progress bar at the top
 * (Apple-style indeterminate). The map content fades in as soon as data is
 * ready.
 */
export default function MapLoading() {
  return (
    <div
      className="fixed inset-0 z-0 flex flex-col items-center justify-center bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-transparent"
      >
        <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-primary/70" />
      </div>
      <span className="sr-only">Memuat peta sebaran stunting…</span>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
