/**
 * Fullscreen indeterminate loading state for `/map`. The map page itself
 * owns every `position: fixed` overlay, so during route transitions this
 * file paints a thin top progress bar against a neutral background — Apple-
 * style "something is happening" feedback that disappears the moment the
 * real surface paints in.
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
