import * as Sentry from "@sentry/nextjs";
import { env } from "@/config/env";

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NODE_ENV,
    enabled: env.NODE_ENV === "production",
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
