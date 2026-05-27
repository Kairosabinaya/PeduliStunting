/**
 * Port for structured logging. The infrastructure layer provides a Pino-based
 * implementation. Domain and application layers depend only on this interface.
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export type LogContext = Readonly<Record<string, unknown>>;

export interface Logger {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;
  child(bindings: LogContext): Logger;
}
