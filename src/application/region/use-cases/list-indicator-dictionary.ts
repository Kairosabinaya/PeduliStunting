import { map, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { IndicatorDictionaryRepository } from "@/domain/region/ports/indicator-dictionary-repository";
import { toIndicatorDefinitionDto, type IndicatorDefinitionDto } from "../dtos";

export class ListIndicatorDictionaryUseCase {
  constructor(private readonly repository: IndicatorDictionaryRepository) {}

  async execute(): Promise<Result<readonly IndicatorDefinitionDto[], AppError>> {
    const result = await this.repository.list();
    return map(result, (rows) => rows.map(toIndicatorDefinitionDto));
  }
}
