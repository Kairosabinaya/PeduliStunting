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

import { UpdateChildUseCase, type UpdateChildCommand } from "./update-child";

const userId = asUserId("00000000-0000-0000-0000-000000000001");
const childId = asChildId("00000000-0000-0000-0000-000000000002");

function makeChild(): Child {
  return new Child({
    id: childId,
    userId,
    name: "Anak Lama",
    sex: "L",
    birthDate: asDateOnly("2024-01-15"),
    birthWeightKg: 3.3,
    birthLengthCm: 50,
    gestationalAgeWeeks: 38,
    notes: null,
    deletedAt: null,
  });
}

function makeCommand(): UpdateChildCommand {
  return {
    userId,
    childId,
    name: "Anak Baru",
    sex: "P",
    birthDate: asDateOnly("2024-02-20"),
    birthWeightKg: 3.1,
    birthLengthCm: 49,
    gestationalAgeWeeks: null,
    notes: "Diperbaiki",
  };
}

class InMemoryChildRepository implements ChildRepository {
  public updateCalls: UpdateChildInput[] = [];
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

  async update(input: UpdateChildInput): Promise<Result<Child, AppError>> {
    this.updateCalls.push(input);
    const updated = new Child({
      id: childId,
      userId: input.userId,
      name: input.name,
      sex: input.sex,
      birthDate: input.birthDate,
      birthWeightKg: input.birthWeightKg,
      birthLengthCm: input.birthLengthCm,
      gestationalAgeWeeks: input.gestationalAgeWeeks,
      notes: input.notes,
      deletedAt: null,
    });
    this.child = updated;
    return ok(updated);
  }

  async softDelete(): Promise<Result<void, AppError>> {
    return ok(undefined);
  }
}

describe("UpdateChildUseCase", () => {
  describe("execute", () => {
    it("should overwrite the child's fields and return the updated DTO", async () => {
      const repository = new InMemoryChildRepository();
      repository.seed(makeChild());
      const useCase = new UpdateChildUseCase(repository);

      const result = await useCase.execute(makeCommand());

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe("Anak Baru");
        expect(result.value.sex).toBe("P");
        expect(result.value.gestationalAgeWeeks).toBeNull();
        expect(result.value.notes).toBe("Diperbaiki");
      }
      expect(repository.updateCalls).toHaveLength(1);
    });

    it("should return a not_found error when the child does not exist", async () => {
      const repository = new InMemoryChildRepository();
      const useCase = new UpdateChildUseCase(repository);

      const result = await useCase.execute(makeCommand());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("not_found");
      }
      expect(repository.updateCalls).toHaveLength(0);
    });

    it("should not update a child owned by another user", async () => {
      const repository = new InMemoryChildRepository();
      repository.seed(makeChild());
      const useCase = new UpdateChildUseCase(repository);

      const result = await useCase.execute({
        ...makeCommand(),
        userId: asUserId("00000000-0000-0000-0000-0000000000ff"),
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("not_found");
      }
      expect(repository.updateCalls).toHaveLength(0);
    });
  });
});
