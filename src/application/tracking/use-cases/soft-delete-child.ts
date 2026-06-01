import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { err, type Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";

/**
 * Soft-delete a child profile the current user owns. The child is first looked
 * up so a missing (or non-owned) id surfaces as a {@link AppErrors.notFound}
 * instead of silently succeeding — the underlying `UPDATE ... WHERE id = ?`
 * affects zero rows when the child does not exist, which would otherwise read
 * as success. RLS still scopes every query to the owner; the explicit lookup is
 * defence in depth and gives the presentation layer a precise error to map.
 */
export class SoftDeleteChildUseCase {
  constructor(private readonly repository: ChildRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<void, AppError>> {
    const found = await this.repository.findById(userId, childId);
    if (!found.ok) {
      return found;
    }
    if (!found.value) {
      return err(AppErrors.notFound("Anak tidak ditemukan.", "child"));
    }
    return this.repository.softDelete(userId, childId);
  }
}
