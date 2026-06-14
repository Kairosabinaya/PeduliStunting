import { describe, expect, it } from "vitest";

import { ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import { asChildId, asUserId } from "@/domain/shared/ids";
import { asDateOnly } from "@/domain/shared/date-only";
import { Child } from "@/domain/tracking/entities/child";
import type {
  ChildRepository,
  NewChildInput,
  UpdateChildInput,
} from "@/domain/tracking/ports/child-repository";

import { SoftDeleteChildUseCase } from "./soft-delete-child";

const userId = asUserId("00000000-0000-0000-0000-000000000001");
const childId = asChildId("00000000-0000-0000-0000-000000000002");

function makeChild(): Child {
  return new Child({
    id: childId,
    userId,
    name: "Anak Uji",
    sex: "L",
    birthDate: asDateOnly("2024-01-15"),
    birthWeightKg: 3.3,
    birthLengthCm: 50,
    gestationalAgeWeeks: 38,
    notes: null,
    deletedAt: null,
  });
}

class InMemoryChildRepository implements ChildRepository {
  public softDeleteCalls: { userId: string; childId: string }[] = [];
  private child: Child | null = null;

  seed(child: Child): void {
    this.child = child;
  }

  async listByOwner(): Promise<Result<readonly Child[], AppError>> {
    return ok(this.child ? [this.child] : []);
  }

  async findById(
    owner: string,
    id: string,
  ): Promise<Result<Child | null, AppError>> {
    if (this.child && this.child.userId === owner && this.child.id === id) {
      return ok(this.child);
    }
    return ok(null);
  }

  async create(_input: NewChildInput): Promise<Result<Child, AppError>> {
    throw new Error("not implemented in this fake");
  }

  async update(_input: UpdateChildInput): Promise<Result<Child, AppError>> {
    throw new Error("not implemented in this fake");
  }

  async softDelete(owner: string, id: string): Promise<Result<void, AppError>> {
    this.softDeleteCalls.push({ userId: owner, childId: id });
    this.child = null;
    return ok(undefined);
  }

  async restore(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

describe("SoftDeleteChildUseCase", () => {
  describe("execute", () => {
    it("should soft-delete the child when it exists and is owned by the user", async () => {
      const repository = new InMemoryChildRepository();
      repository.seed(makeChild());
      const useCase = new SoftDeleteChildUseCase(repository);

      const result = await useCase.execute(userId, childId);

      expect(result.ok).toBe(true);
      expect(repository.softDeleteCalls).toEqual([{ userId, childId }]);
    });

    it("should return a not_found error when the child does not exist", async () => {
      const repository = new InMemoryChildRepository();
      const useCase = new SoftDeleteChildUseCase(repository);

      const result = await useCase.execute(userId, childId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("not_found");
      }
      expect(repository.softDeleteCalls).toHaveLength(0);
    });

    it("should not delete a child owned by another user", async () => {
      const repository = new InMemoryChildRepository();
      repository.seed(makeChild());
      const useCase = new SoftDeleteChildUseCase(repository);

      const result = await useCase.execute(
        asUserId("00000000-0000-0000-0000-0000000000ff"),
        childId,
      );

      expect(result.ok).toBe(false);
      expect(repository.softDeleteCalls).toHaveLength(0);
    });
  });
});
