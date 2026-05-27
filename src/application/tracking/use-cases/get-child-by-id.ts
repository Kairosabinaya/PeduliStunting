import { AppErrors, type AppError } from "@/domain/errors/app-error";
import { flatMap, err, ok, type Result } from "@/domain/shared/result";
import type { ChildId, UserId } from "@/domain/shared/ids";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";
import { toChildDto, type ChildDto } from "../dtos";

export class GetChildByIdUseCase {
  constructor(private readonly repository: ChildRepository) {}

  async execute(
    userId: UserId,
    childId: ChildId,
  ): Promise<Result<ChildDto, AppError>> {
    const result = await this.repository.findById(userId, childId);
    return flatMap(result, (child) => {
      if (!child) {
        return err(AppErrors.notFound("Anak tidak ditemukan.", "child"));
      }
      return ok(toChildDto(child));
    });
  }
}
