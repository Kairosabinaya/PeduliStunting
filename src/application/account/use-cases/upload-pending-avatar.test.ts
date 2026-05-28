import { describe, expect, it, vi } from "vitest";

import { ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { AvatarStoragePort } from "@/domain/account/ports/avatar-storage";

import { UploadPendingAvatarUseCase } from "./upload-pending-avatar";

const JPEG_BODY = new Uint8Array(4096);
JPEG_BODY[0] = 0xff;
JPEG_BODY[1] = 0xd8;
JPEG_BODY[2] = 0xff;

class FakeAvatarStorage implements AvatarStoragePort {
  uploadPendingMock = vi.fn(
    async (_input: {
      bytes: Uint8Array;
      contentType: "image/jpeg" | "image/png" | "image/webp";
    }): Promise<
      Result<{ readonly path: string; readonly publicUrl: string }, AppError>
    > =>
      ok({
        path: "_signup/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.jpg",
        publicUrl:
          "https://example.test/storage/v1/object/public/avatars/_signup/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.jpg",
      }),
  );

  uploadPending(input: {
    bytes: Uint8Array;
    contentType: "image/jpeg" | "image/png" | "image/webp";
  }) {
    return this.uploadPendingMock(input);
  }

  uploadForUser = vi.fn();
  remove = vi.fn();
}

describe("UploadPendingAvatarUseCase", () => {
  it("uploads a valid JPEG and returns the path + URL", async () => {
    const storage = new FakeAvatarStorage();
    const useCase = new UploadPendingAvatarUseCase(storage);

    const result = await useCase.execute({
      bytes: JPEG_BODY,
      claimedMime: "image/jpeg",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.path).toMatch(/^_signup\//u);
    expect(storage.uploadPendingMock).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: "image/jpeg" }),
    );
  });

  it("returns a validation error when bytes are too small", async () => {
    const storage = new FakeAvatarStorage();
    const useCase = new UploadPendingAvatarUseCase(storage);

    const result = await useCase.execute({
      bytes: new Uint8Array(128),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
    expect(storage.uploadPendingMock).not.toHaveBeenCalled();
  });

  it("returns a validation error when MIME signature is unknown", async () => {
    const storage = new FakeAvatarStorage();
    const useCase = new UploadPendingAvatarUseCase(storage);
    const garbage = new Uint8Array(4096);
    garbage[0] = 0x00;
    garbage[1] = 0x00;

    const result = await useCase.execute({ bytes: garbage });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
    expect(storage.uploadPendingMock).not.toHaveBeenCalled();
  });

  it("propagates storage failures without throwing", async () => {
    const storage = new FakeAvatarStorage();
    storage.uploadPendingMock.mockResolvedValueOnce({
      ok: false,
      error: {
        kind: "external_service",
        message: "Storage down",
      },
    });
    const useCase = new UploadPendingAvatarUseCase(storage);

    const result = await useCase.execute({ bytes: JPEG_BODY });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("external_service");
  });
});
