import { describe, expect, it } from "vitest";

import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, ok, type Result } from "@/domain/shared/result";
import { asChildId, asUserId } from "@/domain/shared/ids";
import type { Child } from "@/domain/tracking/entities/child";
import type {
  ChildRepository,
  NewChildInput,
  UpdateChildInput,
} from "@/domain/tracking/ports/child-repository";

import { RestoreChildUseCase } from "./restore-child";

const userId = asUserId("00000000-0000-0000-0000-000000000001");
const childId = asChildId("00000000-0000-0000-0000-000000000002");

/**
 * Fake that models the conditional `UPDATE ... WHERE deleted_at IS NOT NULL`:
 * restore only succeeds for a child that is currently soft-deleted and owned
 * by the caller; everything else maps to not_found, mirroring the Supabase
 * repository's zero-row behaviour.
 */
class InMemoryChildRepository implements ChildRepository {
  public restoreCalls: { userId: string; childId: string }[] = [];

  constructor(
    private readonly state: {
      ownerId: string;
      id: string;
      deleted: boolean;
    } | null,
  ) {}

  async listByOwner(): Promise<Result<readonly Child[], AppError>> {
    return ok([]);
  }

  async findById(): Promise<Result<Child | null, AppError>> {
    return ok(null);
  }

  async create(_input: NewChildInput): Promise<Result<Child, AppError>> {
    throw new Error("not implemented in this fake");
  }

  async update(_input: UpdateChildInput): Promise<Result<Child, AppError>> {
    throw new Error("not implemented in this fake");
  }

  async softDelete(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }

  async restore(owner: string, id: string): Promise<Result<void, AppError>> {
    this.restoreCalls.push({ userId: owner, childId: id });
    if (
      this.state &&
      this.state.ownerId === owner &&
      this.state.id === id &&
      this.state.deleted
    ) {
      this.state.deleted = false;
      return ok(undefined);
    }
    return err(AppErrors.notFound("Anak tidak ditemukan.", "child"));
  }
}

describe("RestoreChildUseCase", () => {
  describe("execute", () => {
    it("should restore a soft-deleted child owned by the user", async () => {
      const repository = new InMemoryChildRepository({
        ownerId: userId,
        id: childId,
        deleted: true,
      });
      const useCase = new RestoreChildUseCase(repository);

      const result = await useCase.execute(userId, childId);

      expect(result.ok).toBe(true);
      expect(repository.restoreCalls).toEqual([{ userId, childId }]);
    });

    it("should return not_found when the child is not soft-deleted", async () => {
      const repository = new InMemoryChildRepository({
        ownerId: userId,
        id: childId,
        deleted: false,
      });
      const useCase = new RestoreChildUseCase(repository);

      const result = await useCase.execute(userId, childId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("not_found");
      }
    });

    it("should not restore a child owned by another user", async () => {
      const repository = new InMemoryChildRepository({
        ownerId: userId,
        id: childId,
        deleted: true,
      });
      const useCase = new RestoreChildUseCase(repository);

      const result = await useCase.execute(
        asUserId("00000000-0000-0000-0000-0000000000ff"),
        childId,
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("not_found");
      }
    });
  });
});
