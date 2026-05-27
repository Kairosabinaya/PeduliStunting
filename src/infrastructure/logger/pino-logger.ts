import pino, { type Logger as PinoLogger } from "pino";
import { env } from "@/config/env";
import type { Logger, LogContext } from "@/domain/shared/logger";

const PII_FIELDS = [
  "email",
  "phone",
  "address",
  "nik",
  "password",
  "token",
  "authorization",
] as const;

function createBaseLogger(): PinoLogger {
  return pino({
    level: env.LOG_LEVEL,
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        ...PII_FIELDS.map((f) => `*.${f}`),
        ...PII_FIELDS.map((f) => `${f}`),
      ],
      censor: "[REDACTED]",
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
  });
}

class PinoLoggerAdapter implements Logger {
  constructor(private readonly delegate: PinoLogger) {}

  trace(message: string, context?: LogContext): void {
    this.delegate.trace(context ?? {}, message);
  }
  debug(message: string, context?: LogContext): void {
    this.delegate.debug(context ?? {}, message);
  }
  info(message: string, context?: LogContext): void {
    this.delegate.info(context ?? {}, message);
  }
  warn(message: string, context?: LogContext): void {
    this.delegate.warn(context ?? {}, message);
  }
  error(message: string, context?: LogContext): void {
    this.delegate.error(context ?? {}, message);
  }
  fatal(message: string, context?: LogContext): void {
    this.delegate.fatal(context ?? {}, message);
  }
  child(bindings: LogContext): Logger {
    return new PinoLoggerAdapter(this.delegate.child(bindings));
  }
}

let cached: Logger | undefined;

export function getLogger(): Logger {
  if (!cached) {
    cached = new PinoLoggerAdapter(createBaseLogger());
  }
  return cached;
}
