import { z } from "zod";

/**
 * Boundary schemas for avatar handling. Server Actions consume these to
 * validate file uploads (`AvatarFileSchema`) and persisted pending paths
 * (`AvatarPendingPathSchema`) before talking to Supabase Storage. All
 * limits surface in the UI hint copy so the validator and the form never
 * disagree.
 *
 * See ADR-0008 for the rationale on uploading via a service-role admin
 * client during sign-up (no session yet) and isolating pending uploads
 * under the `_signup/` folder.
 */

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MiB
export const AVATAR_MIN_BYTES = 1024; // 1 KiB — rejects 0-byte / truncated reads
export const AVATAR_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const AVATAR_PENDING_PREFIX = "_signup/";
export const AVATAR_USER_PREFIX = "users/";

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME)[number];

/**
 * MIME magic-byte signatures used to verify that the uploaded bytes match
 * the claimed `Content-Type`. We never trust the client-supplied MIME
 * field — a malicious upload may declare `image/jpeg` for an executable.
 */
const MIME_SIGNATURES: ReadonlyArray<{
  readonly mime: AvatarMimeType;
  readonly matches: (bytes: Uint8Array) => boolean;
}> = [
  {
    mime: "image/jpeg",
    matches: (b) =>
      b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    matches: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    mime: "image/webp",
    matches: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

/**
 * Detect the actual MIME type from the first bytes of a file. Returns
 * `null` when none of the supported signatures match.
 */
export function detectImageMime(bytes: Uint8Array): AvatarMimeType | null {
  for (const { mime, matches } of MIME_SIGNATURES) {
    if (matches(bytes)) return mime;
  }
  return null;
}

export const avatarMimeSchema = z.enum(AVATAR_ALLOWED_MIME);

/**
 * Zod schema for an uploaded avatar file. `bytes` is the file body as a
 * `Uint8Array` (or `Buffer`, which extends `Uint8Array`). `claimedMime`
 * is what the client said the content type is — we only use it as a hint
 * and re-derive the authoritative MIME from the magic bytes.
 */
export const AvatarFileSchema = z
  .object({
    bytes: z.custom<Uint8Array>(
      (v): v is Uint8Array => v instanceof Uint8Array,
      "Body file tidak valid.",
    ),
    claimedMime: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const size = value.bytes.byteLength;
    if (size < AVATAR_MIN_BYTES) {
      ctx.addIssue({
        code: "custom",
        path: ["bytes"],
        message: "File foto terlalu kecil atau rusak.",
      });
      return;
    }
    if (size > AVATAR_MAX_BYTES) {
      ctx.addIssue({
        code: "custom",
        path: ["bytes"],
        message: "Ukuran foto maksimal 2 MB.",
      });
      return;
    }
    const detected = detectImageMime(value.bytes);
    if (!detected) {
      ctx.addIssue({
        code: "custom",
        path: ["bytes"],
        message: "Format foto harus JPG, PNG, atau WebP.",
      });
      return;
    }
    if (value.claimedMime && value.claimedMime !== detected) {
      ctx.addIssue({
        code: "custom",
        path: ["claimedMime"],
        message: "Tipe file tidak cocok dengan isi file.",
      });
    }
  })
  .transform((value) => {
    const detected = detectImageMime(value.bytes);
    if (!detected) {
      // Unreachable: superRefine above already rejects this. Narrowing for
      // the type system without throwing across the boundary.
      throw new Error("avatar mime detection drifted from validation");
    }
    return { bytes: value.bytes, mime: detected };
  });

export type AvatarFile = z.infer<typeof AvatarFileSchema>;

const PENDING_PATH_REGEX =
  /^_signup\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/u;

/**
 * Zod schema for a path returned by `uploadPendingAvatar` and later
 * consumed by `signUpWithPassword`. Locked to the `_signup/` prefix with
 * a UUID v4 filename so the sign-up action cannot be tricked into
 * pointing at an existing avatar in `users/{uid}/...`.
 */
export const AvatarPendingPathSchema = z
  .string()
  .regex(PENDING_PATH_REGEX, "Pending path tidak valid.");

export type AvatarPendingPath = z.infer<typeof AvatarPendingPathSchema>;

export function extensionForMime(mime: AvatarMimeType): "jpg" | "png" | "webp" {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}
