import { describe, expect, it } from "vitest";

import {
  AVATAR_MAX_BYTES,
  AvatarFileSchema,
  AvatarPendingPathSchema,
  detectImageMime,
  extensionForMime,
} from "./avatar";

/* ─────────────────────────── helpers ─────────────────────────── */

function pad(prefix: number[], totalLength: number): Uint8Array {
  const out = new Uint8Array(totalLength);
  out.set(prefix, 0);
  return out;
}

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP_MAGIC = [
  0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
];
const RANDOM_MAGIC = [0x00, 0x01, 0x02, 0x03, 0x04];

/* ─────────────────────────── detectImageMime ─────────────────────────── */

describe("detectImageMime", () => {
  it("recognises JPEG", () => {
    expect(detectImageMime(pad(JPEG_MAGIC, 16))).toBe("image/jpeg");
  });

  it("recognises PNG", () => {
    expect(detectImageMime(pad(PNG_MAGIC, 16))).toBe("image/png");
  });

  it("recognises WebP", () => {
    expect(detectImageMime(pad(WEBP_MAGIC, 24))).toBe("image/webp");
  });

  it("returns null for unknown bytes", () => {
    expect(detectImageMime(pad(RANDOM_MAGIC, 16))).toBeNull();
  });

  it("returns null for too-short buffers", () => {
    expect(detectImageMime(new Uint8Array([0xff]))).toBeNull();
  });
});

/* ─────────────────────────── AvatarFileSchema ─────────────────────────── */

describe("AvatarFileSchema", () => {
  it("accepts a JPEG that is within the size window", () => {
    const result = AvatarFileSchema.safeParse({
      bytes: pad(JPEG_MAGIC, 4096),
      claimedMime: "image/jpeg",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.mime).toBe("image/jpeg");
  });

  it("rejects files smaller than the minimum", () => {
    const result = AvatarFileSchema.safeParse({
      bytes: pad(JPEG_MAGIC, 256),
      claimedMime: "image/jpeg",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/terlalu kecil/iu);
    }
  });

  it("rejects files larger than the maximum", () => {
    const oversize = pad(JPEG_MAGIC, AVATAR_MAX_BYTES + 1);
    const result = AvatarFileSchema.safeParse({
      bytes: oversize,
      claimedMime: "image/jpeg",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/maksimal 2 MB/iu);
    }
  });

  it("rejects unrecognised MIME signatures", () => {
    const result = AvatarFileSchema.safeParse({
      bytes: pad(RANDOM_MAGIC, 4096),
      claimedMime: "image/jpeg",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/JPG, PNG, atau WebP/iu);
    }
  });

  it("rejects when claimedMime contradicts the bytes", () => {
    const result = AvatarFileSchema.safeParse({
      bytes: pad(PNG_MAGIC, 4096),
      claimedMime: "image/jpeg",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/tidak cocok/iu);
    }
  });

  it("accepts when claimedMime is omitted", () => {
    const result = AvatarFileSchema.safeParse({
      bytes: pad(PNG_MAGIC, 4096),
    });
    expect(result.success).toBe(true);
  });
});

/* ─────────────────────── AvatarPendingPathSchema ─────────────────────── */

describe("AvatarPendingPathSchema", () => {
  it("accepts a well-formed pending path", () => {
    expect(
      AvatarPendingPathSchema.safeParse(
        "_signup/0123abcd-0123-4567-89ab-0123456789ab.jpg",
      ).success,
    ).toBe(true);
  });

  it("accepts every supported extension", () => {
    for (const ext of ["jpg", "jpeg", "png", "webp"] as const) {
      expect(
        AvatarPendingPathSchema.safeParse(
          `_signup/0123abcd-0123-4567-89ab-0123456789ab.${ext}`,
        ).success,
      ).toBe(true);
    }
  });

  it("rejects a path outside the _signup/ prefix", () => {
    expect(
      AvatarPendingPathSchema.safeParse(
        "users/00000000-0000-0000-0000-000000000000/avatar.jpg",
      ).success,
    ).toBe(false);
  });

  it("rejects directory traversal attempts", () => {
    expect(
      AvatarPendingPathSchema.safeParse("_signup/../etc/passwd").success,
    ).toBe(false);
  });

  it("rejects unknown extensions", () => {
    expect(
      AvatarPendingPathSchema.safeParse(
        "_signup/0123abcd-0123-4567-89ab-0123456789ab.gif",
      ).success,
    ).toBe(false);
  });

  it("rejects empty strings", () => {
    expect(AvatarPendingPathSchema.safeParse("").success).toBe(false);
  });
});

/* ─────────────────────────── extensionForMime ─────────────────────────── */

describe("extensionForMime", () => {
  it("returns the expected extension for each MIME", () => {
    expect(extensionForMime("image/jpeg")).toBe("jpg");
    expect(extensionForMime("image/png")).toBe("png");
    expect(extensionForMime("image/webp")).toBe("webp");
  });
});
