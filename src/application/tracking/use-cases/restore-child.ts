import { type AppError } from "@/domain/errors/app-error";
import { type Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";

/**
 * Restore a previously soft-deleted child profile the current user owns — the
 * undo path for {@link SoftDeleteChildUseCase}.
 *
 * Unlike soft-delete this does NOT pre-check via `findById`, because that query
 * filters out soft-deleted rows (the only ones eligible for restore). The
 * repository's conditional `UPDATE ... WHERE deleted_at IS NOT NULL` is the
 * existence check: it returns `not_found` when no soft-deleted, owned row
 * matches, so a wrong id or an already-active child surfaces a precise error.
 */
export class RestoreChildUseCase {
  constructor(private readonly repository: ChildRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<void, AppError>> {
    return this.repository.restore(userId, childId);
  }
}
