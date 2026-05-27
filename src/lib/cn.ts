import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind utility classes. Combines clsx (conditional joining) with
 * tailwind-merge (collision resolution).
 *
 * @example
 * ```ts
 * cn("px-2 py-1", isActive && "bg-primary", className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
