import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelMetadataRepository } from "@/domain/model/ports/model-metadata-repository";
import { toModelMetadataDto, type ModelMetadataDto } from "../dtos";

export class ListModelMetadataUseCase {
  constructor(private readonly repository: ModelMetadataRepository) {}

  async execute(): Promise<Result<readonly ModelMetadataDto[], AppError>> {
    const result = await this.repository.list();
    return map(result, (rows) => rows.map(toModelMetadataDto));
  }
}
