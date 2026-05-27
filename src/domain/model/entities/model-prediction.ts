import type { ModelVersion } from "@/domain/shared/ids";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";
import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import type { ClassProbabilities } from "../value-objects/class-probabilities";

export class ModelPrediction {
  readonly modelVersion: ModelVersion;
  readonly kodeBps: KodeBps;
  readonly tahun: Year;
  readonly predictedCategory: StuntingCategory;
  readonly probabilities: ClassProbabilities;

  constructor(props: {
    modelVersion: ModelVersion;
    kodeBps: KodeBps;
    tahun: Year;
    predictedCategory: StuntingCategory;
    probabilities: ClassProbabilities;
  }) {
    this.modelVersion = props.modelVersion;
    this.kodeBps = props.kodeBps;
    this.tahun = props.tahun;
    this.predictedCategory = props.predictedCategory;
    this.probabilities = props.probabilities;
  }
}
