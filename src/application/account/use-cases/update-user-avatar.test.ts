import { describe, expect, it, vi } from "vitest";

import { ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import { asUserId } from "@/domain/shared/ids";
import { UserProfile } from "@/domain/account/entities/user-profile";
import type { AvatarStoragePort } from "@/domain/account/ports/avatar-storage";
import type { UserProfileRepository } from "@/domain/account/ports/user-profile-repository";

import { UpdateUserAvatarUseCase } from "./update-user-avatar";

const USER_ID = asUserId("00000000-0000-0000-0000-000000000001");

function makeProfile(avatarUrl: string | null): UserProfile {
  return new UserProfile({
    userId: USER_ID,
    displayName: "Ibu Sari",
    avatarUrl,
    role: "user",
    themePreference: "system",
    locale: "id-ID",
  });
}

const NEW_PUBLIC_URL =
  "https://example.test/storage/v1/object/public/avatars/users/00000000-0000-0000-0000-000000000001/avatar.jpg";
const OLD_PUBLIC_URL =
  "https://example.test/storage/v1/object/public/avatars/users/00000000-0000-0000-0000-000000000001/old.jpg";

const JPEG_BODY = new Uint8Array(4096);
JPEG_BODY[0] = 0xff;
JPEG_BODY[1] = 0xd8;
JPEG_BODY[2] = 0xff;

function makeFakeProfileRepo(): UserProfileRepository & {
  updateAvatarMock: ReturnType<typeof vi.fn>;
} {
  const updateAvatarMock = vi.fn(
    async (input: {
      userId: ReturnType<typeof asUserId>;
      avatarUrl: string | null;
    }): Promise<Result<UserProfile, AppError>> =>
      ok(makeProfile(input.avatarUrl)),
  );
  return {
    updateAvatarMock,
    findByUserId: vi.fn(),
    updatePreferences: vi.fn(),
    updateAvatar: updateAvatarMock,
  };
}

function makeFakeStorage(): AvatarStoragePort & {
  uploadForUserMock: ReturnType<typeof vi.fn>;
  removeMock: ReturnType<typeof vi.fn>;
} {
  const uploadForUserMock = vi.fn(
    async (): Promise<
      Result<{ readonly path: string; readonly publicUrl: string }, AppError>
    > =>
      ok({
        path: "users/00000000-0000-0000-0000-000000000001/avatar.jpg",
        publicUrl: NEW_PUBLIC_URL,
      }),
  );
  const removeMock = vi.fn(
    async (): Promise<Result<void, AppError>> => ok(undefined),
  );
  return {
    uploadForUserMock,
    removeMock,
    uploadPending: vi.fn(),
    uploadForUser: uploadForUserMock,
    remove: removeMock,
  };
}

describe("UpdateUserAvatarUseCase", () => {
  it("replaces an existing avatar and deletes the previous file", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "replace",
      userId: USER_ID,
      previousAvatarUrl: OLD_PUBLIC_URL,
      bytes: JPEG_BODY,
      claimedMime: "image/jpeg",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.avatarUrl).toBe(NEW_PUBLIC_URL);
    expect(storage.uploadForUserMock).toHaveBeenCalledOnce();
    expect(profiles.updateAvatarMock).toHaveBeenCalledWith({
      userId: USER_ID,
      avatarUrl: NEW_PUBLIC_URL,
    });
    expect(storage.removeMock).toHaveBeenCalledWith(
      "users/00000000-0000-0000-0000-000000000001/old.jpg",
    );
  });

  it("does not delete the previous avatar when there was none", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "replace",
      userId: USER_ID,
      previousAvatarUrl: null,
      bytes: JPEG_BODY,
      claimedMime: "image/jpeg",
    });

    expect(result.ok).toBe(true);
    expect(storage.removeMock).not.toHaveBeenCalled();
  });

  it("does not delete the previous avatar when the new URL is identical", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "replace",
      userId: USER_ID,
      previousAvatarUrl: NEW_PUBLIC_URL,
      bytes: JPEG_BODY,
      claimedMime: "image/jpeg",
    });

    expect(result.ok).toBe(true);
    expect(storage.removeMock).not.toHaveBeenCalled();
  });

  it("clears the avatar and deletes the previous file", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "clear",
      userId: USER_ID,
      previousAvatarUrl: OLD_PUBLIC_URL,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.avatarUrl).toBeNull();
    expect(profiles.updateAvatarMock).toHaveBeenCalledWith({
      userId: USER_ID,
      avatarUrl: null,
    });
    expect(storage.removeMock).toHaveBeenCalledWith(
      "users/00000000-0000-0000-0000-000000000001/old.jpg",
    );
    expect(storage.uploadForUserMock).not.toHaveBeenCalled();
  });

  it("returns validation error and does not touch storage when bytes are invalid", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "replace",
      userId: USER_ID,
      previousAvatarUrl: null,
      bytes: new Uint8Array(256),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
    expect(storage.uploadForUserMock).not.toHaveBeenCalled();
    expect(profiles.updateAvatarMock).not.toHaveBeenCalled();
  });

  it("propagates storage upload failures", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    storage.uploadForUserMock.mockResolvedValueOnce({
      ok: false,
      error: { kind: "external_service", message: "down" },
    });
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "replace",
      userId: USER_ID,
      previousAvatarUrl: null,
      bytes: JPEG_BODY,
      claimedMime: "image/jpeg",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("external_service");
    expect(profiles.updateAvatarMock).not.toHaveBeenCalled();
  });

  it("ignores foreign URLs when deleting the previous avatar", async () => {
    const profiles = makeFakeProfileRepo();
    const storage = makeFakeStorage();
    const useCase = new UpdateUserAvatarUseCase(profiles, storage);

    const result = await useCase.execute({
      kind: "clear",
      userId: USER_ID,
      previousAvatarUrl: "https://lh3.googleusercontent.com/a/example",
    });

    expect(result.ok).toBe(true);
    expect(storage.removeMock).not.toHaveBeenCalled();
  });
});
