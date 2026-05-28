/**
 * Two-letter avatar fallback used wherever a user-uploaded photo is
 * unavailable (sign-up preview, header avatar menu, account page).
 *
 * Priority:
 *   1. Initials of the display name (first + last word).
 *   2. First two characters of the email's local part.
 *   3. `PS` (Peduli Stunting) as a final fallback.
 *
 * Never leaks more PII than what is already on the calling surface —
 * callers should not pass full email addresses into copy that is itself
 * hidden behind auth.
 *
 * @example
 * initialsOf("Budi Santoso");        // "BS"
 * initialsOf("Sari");                // "S"
 * initialsOf(null, "anita@x.test");  // "AN"
 * initialsOf(null, null);            // "PS"
 */
export function initialsOf(
  name?: string | null,
  email?: string | null,
): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/u);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    const joined = `${first}${last}`.toUpperCase();
    if (joined.length > 0) return joined;
  }
  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase();
  }
  return "PS";
}
