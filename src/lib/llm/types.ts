/** Types for LLM-generated report content. */

export interface ReportContent {
  summary: string;
  interpretation: string;
  recommendation: string;
}

export interface SimulationReportData {
  simulationId: string;
  provinceName: string;
  year: number;
  inputParams: Record<string, number>;
  predictedCategory: string;
  pRendah: number;
  pSedang: number;
  pTinggi: number;
  significantVars: string[];
  changedVariables: { name: string; before: number; after: number }[];
}
