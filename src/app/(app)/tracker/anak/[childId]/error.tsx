"use client";

import { Button } from "@/components/primitives/button";
import { ErrorState } from "@/components/primitives/error-state";
import { TRACKER_LIST_COPY } from "@/config/tracker";

interface ChildErrorBoundaryProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ChildErrorBoundary({
  error,
  reset,
}: ChildErrorBoundaryProps) {
  return (
    <div className="py-12">
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={
          error.message || TRACKER_LIST_COPY.errorDescriptionFallback
        }
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
