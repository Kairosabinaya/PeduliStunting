"use client";

import { Button } from "@/components/primitives/button";
import { ErrorState } from "@/components/primitives/error-state";
import { MAP_COPY } from "@/config/map";

interface MapErrorBoundaryProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Route-segment error boundary for `/map`. Surfaces the friendly state
 * primitive and forwards the digest as the user-quotable correlation ID. The
 * raw stack is left for Sentry — never shown to the user.
 */
export default function MapError({ error, reset }: MapErrorBoundaryProps) {
  return (
    <div className="py-12">
      <ErrorState
        title={MAP_COPY.title}
        description="Terjadi galat saat memuat data peta. Coba muat ulang, jika berlanjut hubungi tim teknis dengan kode rujukan di bawah."
        {...(error.digest === undefined ? {} : { correlationId: error.digest })}
        action={
          <Button variant="primary" onClick={reset}>
            Coba lagi
          </Button>
        }
      />
    </div>
  );
}
