"use client";

import { Button } from "@/components/primitives/button";
import { ErrorState } from "@/components/primitives/error-state";
import { TRACKER_LIST_COPY } from "@/config/tracker";

interface TrackerSubrouteErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Error boundary for the pregnancy route. Isolates a fetch/render failure so a
 * problem loading the pregnancy summary does not blank the whole tracker shell.
 */
export default function PregnancyErrorBoundary({
  error,
  reset,
}: TrackerSubrouteErrorProps) {
  return (
    <div className="py-12">
      <ErrorState
        title={TRACKER_LIST_COPY.errorTitle}
        description={error.message || TRACKER_LIST_COPY.errorDescriptionFallback}
        {...(error.digest === undefined ? {} : { correlationId: error.digest })}
        action={
          <Button variant="primary" onClick={reset}>
            {TRACKER_LIST_COPY.errorRetry}
          </Button>
        }
      />
    </div>
  );
}
