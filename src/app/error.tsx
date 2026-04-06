/** Global error boundary — menangkap error dan menampilkan UI yang user-friendly. */
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-accent-400 mb-4">Oops!</p>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-foreground/60 mb-8 max-w-md mx-auto">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau
          kembali ke halaman utama.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            type="button"
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="rounded-lg border border-primary-200 px-6 py-2.5 text-sm font-medium hover:bg-primary-50 transition-colors"
          >
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
