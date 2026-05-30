import "server-only";
import { err, ok, type Result } from "@/domain/shared/result";
import type { AppError } from "@/domain/errors/app-error";
import type { IndicatorCode } from "@/domain/shared/ids";
import type { IndicatorDefinition } from "@/domain/region/entities/indicator-definition";
import type { IndicatorDictionaryRepository } from "@/domain/region/ports/indicator-dictionary-repository";
import { mapIndicatorDictionaryRow } from "@/schemas/region";
import {
  mapPostgrestError,
  mapUnknownInfrastructureError,
} from "../error-mapping";
import type { TypedSupabaseClient } from "../server-client";

// The dashboard consumes every dictionary column (definition + standardization
// recipe + statistics), and this is a 22-row reference table, so a full select
// is appropriate. `*` also keeps the supabase-js select-string type parser from
// hitting its recursion limit on a 24-column explicit list.
const SELECT_COLUMNS = "*";

export class SupabaseIndicatorDictionaryRepository implements IndicatorDictionaryRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Result<readonly IndicatorDefinition[], AppError>> {
    try {
      const { data, error } = await this.client
        .from("indicator_dictionary")
        .select(SELECT_COLUMNS)
        .order("code", { ascending: true });
      if (error) return err(mapPostgrestError(error, "indicator_dictionary"));

      const out: IndicatorDefinition[] = [];
      for (const row of data ?? []) {
        const mapped = mapIndicatorDictionaryRow(row);
        if (!mapped.ok) return err(mapped.error);
        out.push(mapped.value);
      }
      return ok(out);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "indicator_dictionary.list"),
      );
    }
  }

  async findByCode(
    code: IndicatorCode,
  ): Promise<Result<IndicatorDefinition | null, AppError>> {
    try {
      const { data, error } = await this.client
        .from("indicator_dictionary")
        .select(SELECT_COLUMNS)
        .eq("code", code)
        .maybeSingle();
      if (error) return err(mapPostgrestError(error, "indicator_dictionary"));
      if (data === null) return ok(null);
      const mapped = mapIndicatorDictionaryRow(data);
      if (!mapped.ok) return err(mapped.error);
      return ok(mapped.value);
    } catch (cause) {
      return err(
        mapUnknownInfrastructureError(cause, "indicator_dictionary.findByCode"),
      );
    }
  }
}
