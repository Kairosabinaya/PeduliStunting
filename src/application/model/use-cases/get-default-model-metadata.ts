import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { ModelMetadataRepository } from "@/domain/model/ports/model-metadata-repository";
import { toModelMetadataDto, type ModelMetadataDto } from "../dtos";

export class GetDefaultModelMetadataUseCase {
  constructor(private readonly repository: ModelMetadataRepository) {}

  async execute(): Promise<Result<ModelMetadataDto | null, AppError>> {
    const result = await this.repository.findDefault();
    return map(result, (row) => (row ? toModelMetadataDto(row) : null));
  }
}
