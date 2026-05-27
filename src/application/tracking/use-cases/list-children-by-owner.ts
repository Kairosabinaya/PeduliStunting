import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { UserId } from "@/domain/shared/ids";
import type { ChildRepository } from "@/domain/tracking/ports/child-repository";
import { toChildDto, type ChildDto } from "../dtos";

export class ListChildrenByOwnerUseCase {
  constructor(private readonly repository: ChildRepository) {}

  async execute(
    userId: UserId,
  ): Promise<Result<readonly ChildDto[], AppError>> {
    const result = await this.repository.listByOwner(userId);
    return map(result, (rows) => rows.map(toChildDto));
  }
}
