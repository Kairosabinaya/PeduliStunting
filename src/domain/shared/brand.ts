/**
 * Branded (nominal) types. Allows two structurally-identical primitives
 * (e.g. UserId and RegionId both being `string`) to be distinguished at the
 * type level without runtime overhead.
 *
 * @example
 * ```ts
 * type UserId = Brand<string, "UserId">;
 * const id = "abc" as UserId;
 * ```
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };
