import type { ModelVersion } from "@/domain/shared/ids";

/**
 * Catalogue entry for one fitted version of the GTWENOLR model. The free-form
 * JSON columns are kept as `Readonly<Record<string, unknown>>` because their
 * shape is published-experiment specific and validated by the import script,
 * not by the domain.
 */
export class ModelMetadata {
  readonly version: ModelVersion;
  readonly name: string;
  readonly hyperparameters: Readonly<Record<string, unknown>>;
  readonly metrics: Readonly<Record<string, unknown>>;
  readonly moranPerYear: Readonly<Record<string, unknown>>;
  readonly notes: string | null;
  readonly isDefault: boolean;

  constructor(props: {
    version: ModelVersion;
    name: string;
    hyperparameters: Readonly<Record<string, unknown>>;
    metrics: Readonly<Record<string, unknown>>;
    moranPerYear: Readonly<Record<string, unknown>>;
    notes: string | null;
    isDefault: boolean;
  }) {
    this.version = props.version;
    this.name = props.name;
    this.hyperparameters = props.hyperparameters;
    this.metrics = props.metrics;
    this.moranPerYear = props.moranPerYear;
    this.notes = props.notes;
    this.isDefault = props.isDefault;
  }
}
