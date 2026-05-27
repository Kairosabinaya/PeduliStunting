import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { GrowthStandardRepository } from "@/domain/tracking/ports/growth-standard-repository";
import { LmsParams } from "@/domain/tracking/value-objects/lms-params";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import type { Sex } from "@/domain/tracking/value-objects/sex";
import { parseGrowthStandardRow } from "@/schemas/tracking";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

const SELECT_COLUMNS =
  "indicator, sex, age_months, x_value, l, m, s, source, created_at, updated_at";

export class SupabaseGrowthStandardRepository
  implements GrowthStandardRepository
{
  constructor(private readonly client: TypedSupabaseClient) {}

  async findForAge(
    indicator: Exclude<GrowthIndicator, "BB_TB">,
    sex: Sex,
    ageMonths: number,
  ): Promise<Result<LmsParams | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("growth_standards")
        .select(SELECT_COLUMNS)
        .eq("indicator", indicator)
        .eq("sex", sex)
        .eq("age_months", ageMonths)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "growth_standards"));
      if (data === null) return ok(null);
      const parsed = parseGrowthStandardRow(data);
      if (!parsed.ok) return err(parsed.error);
      return ok(
        new LmsParams({
          indicator: parsed.value.indicator,
          sex: parsed.value.sex,
          ageMonths: parsed.value.ageMonths,
          xValue: parsed.value.xValue,
          l: parsed.value.l,
          m: parsed.value.m,
          s: parsed.value.s,
        }),
      );
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "growth_standards.findForAge"),
      );
    }
  }

  async findForLength(
    sex: Sex,
    lengthCm: number,
  ): Promise<Result<LmsParams | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("growth_standards")
        .select(SELECT_COLUMNS)
        .eq("indicator", "BB_TB")
        .eq("sex", sex)
        .lte("x_value", lengthCm)
        .order("x_value", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "growth_standards"));
      if (data === null) return ok(null);
      const parsed = parseGrowthStandardRow(data);
      if (!parsed.ok) return err(parsed.error);
      return ok(
        new LmsParams({
          indicator: parsed.value.indicator,
          sex: parsed.value.sex,
          ageMonths: parsed.value.ageMonths,
          xValue: parsed.value.xValue,
          l: parsed.value.l,
          m: parsed.value.m,
          s: parsed.value.s,
        }),
      );
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "growth_standards.findForLength"),
      );
    }
  }
}
