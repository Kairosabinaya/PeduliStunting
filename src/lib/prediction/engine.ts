/**
 * PredictionEngine — Service class untuk prediksi stunting.
 *
 * Mengimplementasikan cumulative logit model untuk regresi ordinal 3 kategori.
 * Sesuai dengan class PredictionEngine di Class Diagram.
 *
 * Formula:
 *   P(Y <= g | x) = exp(ag + x'B) / (1 + exp(ag + x'B))
 */
import type {
  Coefficients,
  StandardizationParams,
  PredictionResult,
  StuntingCategory,
} from "@/types/database";

export class PredictionEngine {
  /**
   * Menghitung prediksi kategori stunting.
   * Sesuai dengan operation predict() di Class Diagram.
   *
   * @param coefficients - Pre-computed koefisien model (alpha, beta) dari ModelCoefficient
   * @param newValues - Nilai variabel prediktor yang diinput user (raw, belum distandardisasi)
   * @param stdParams - Parameter standardisasi (mean, std) dari PredictorMeta
   * @returns PredictionResult dengan probabilitas 3 kategori
   */
  predict(
    coefficients: Coefficients,
    newValues: Record<string, number>,
    stdParams: Record<string, StandardizationParams>
  ): PredictionResult {
    // Step 1: Hitung linear predictor (x'B) dengan nilai terstandardisasi
    let linearPredictor = 0;

    for (const [key, beta] of Object.entries(coefficients.betaCoefficients)) {
      if (beta !== 0 && newValues[key] !== undefined && stdParams[key]) {
        const params = stdParams[key];
        const standardizedValue = (newValues[key] - params.mean) / params.std;
        linearPredictor += beta * standardizedValue;
      }
    }

    // Step 2: Probabilitas kumulatif via fungsi logistik
    const cumProb1 = this.logistic(coefficients.alpha1 + linearPredictor);
    const cumProb2 = this.logistic(coefficients.alpha2 + linearPredictor);

    // Step 3: Probabilitas per kategori
    const pRendah = cumProb1;
    const pSedang = Math.max(0, cumProb2 - cumProb1);
    const pTinggi = Math.max(0, 1 - cumProb2);

    // Step 4: Normalisasi (handle floating point edge cases)
    const total = pRendah + pSedang + pTinggi;

    return {
      pRendah: pRendah / total,
      pSedang: pSedang / total,
      pTinggi: pTinggi / total,
      predictedCategory: this.getPredictedCategory(
        pRendah / total,
        pSedang / total,
        pTinggi / total
      ),
    };
  }

  /** Numerically stable logistic function. */
  private logistic(x: number): number {
    if (x >= 0) {
      return 1 / (1 + Math.exp(-x));
    }
    const expX = Math.exp(x);
    return expX / (1 + expX);
  }

  /** Tentukan kategori dengan probabilitas tertinggi. */
  private getPredictedCategory(
    pRendah: number,
    pSedang: number,
    pTinggi: number
  ): StuntingCategory {
    const max = Math.max(pRendah, pSedang, pTinggi);
    if (max === pRendah) return "Rendah";
    if (max === pSedang) return "Sedang";
    return "Tinggi";
  }
}
