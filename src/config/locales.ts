/**
 * Single source of truth for locales the application offers in its UI. The
 * profile schema validates inputs against this list so the form selector and
 * the database CHECK ladder cannot drift.
 *
 * Add new entries here AND extend the matching enum in the database before
 * exposing them in any selector.
 */

import { APP_LOCALE } from "./app";

export const SUPPORTED_LOCALES = ["id-ID"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Default locale handed to new profiles. Mirrors {@link APP_LOCALE}. */
export const DEFAULT_LOCALE: SupportedLocale = APP_LOCALE as SupportedLocale;

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
