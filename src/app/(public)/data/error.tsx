"use client";

import { Button } from "@/components/primitives/button";
import { ErrorState } from "@/components/primitives/error-state";
import { DASHBOARD_ERROR } from "@/config/dashboard";

interface DataErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Route-segment error boundary for `/data`. Shows the friendly
 * {@link ErrorState} with a retry and forwards the digest as the user-quotable
 * correlation ID. The raw stack is left for Sentry — never shown to the user.
 */
export default function DataError({ error, reset }: DataErrorProps) {
  return (
    <div className="py-12">
      <ErrorState
        title={DASHBOARD_ERROR.title}
        description={DASHBOARD_ERROR.description}
        {...(error.digest === undefined ? {} : { correlationId: error.digest })}
        action={
          <Button variant="primary" onClick={reset}>
            {DASHBOARD_ERROR.retryLabel}
          </Button>
        }
      />
    </div>
  );
}
