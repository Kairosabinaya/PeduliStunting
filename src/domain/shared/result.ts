/**
 * Discriminated-union return type for operations that can fail.
 *
 * Use cases and domain services return `Result<T, E>` instead of throwing.
 * Exceptions never cross layer boundaries.
 *
 * @example
 * ```ts
 * const result = await useCase.execute(input);
 * if (!result.ok) {
 *   return mapErrorToResponse(result.error);
 * }
 * return mapValueToResponse(result.value);
 * ```
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Construct a successful Result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Construct a failed Result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Type guard for the success branch. */
export function isOk<T, E>(
  result: Result<T, E>,
): result is { readonly ok: true; readonly value: T } {
  return result.ok;
}

/** Type guard for the failure branch. */
export function isErr<T, E>(
  result: Result<T, E>,
): result is { readonly ok: false; readonly error: E } {
  return !result.ok;
}

/**
 * Map the success branch into a new value, leaving failures untouched.
 *
 * @example
 * ```ts
 * const upper = map(ok("hello"), (s) => s.toUpperCase());
 * // upper = { ok: true, value: "HELLO" }
 * ```
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Chain another Result-returning operation onto a success.
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/**
 * Map the failure branch into a different error type.
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/**
 * Convert a throwing function into a Result. The mapper produces the domain
 * error from any thrown value. Use only at boundaries with code we don't
 * control (third-party SDKs, JSON parsing, etc.).
 */
export function fromThrowable<T, E>(
  fn: () => T,
  mapError: (cause: unknown) => E,
): Result<T, E> {
  try {
    return ok(fn());
  } catch (cause) {
    return err(mapError(cause));
  }
}

/**
 * Async version of {@link fromThrowable}.
 */
export async function fromPromise<T, E>(
  promise: Promise<T>,
  mapError: (cause: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return ok(await promise);
  } catch (cause) {
    return err(mapError(cause));
  }
}
