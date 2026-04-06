/** Global loading state — shown during route transitions. */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="mt-4 text-foreground/50 text-sm">Memuat...</p>
      </div>
    </div>
  );
}
