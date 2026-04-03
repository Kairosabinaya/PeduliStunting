/**
 * ReportService — Service class untuk generate laporan PDF.
 *
 * Mengorkestrasi: ambil data simulasi → 3x LLM calls → compile PDF → simpan URL.
 * Sesuai dengan class ReportService di Class Diagram.
 * Sesuai dengan SD-4 (Generate Laporan PDF).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateText } from "@/lib/llm/client";
import { buildSummaryPrompt } from "@/lib/llm/prompts/executive-summary";
import { buildInterpretationPrompt } from "@/lib/llm/prompts/interpretation";
import { buildRecommendationPrompt } from "@/lib/llm/prompts/policy-recommendation";
import { compilePDF } from "@/lib/pdf/compiler";
import type { ReportContent, SimulationReportData } from "@/lib/llm/types";

const SYSTEM_PROMPT = "Kamu adalah analis kebijakan kesehatan masyarakat Indonesia yang ahli dalam bidang stunting dan gizi anak.";

export class ReportService {
  /**
   * Generate laporan PDF dari hasil simulasi.
   * Sesuai dengan operation generateReport() di Class Diagram.
   * Sesuai dengan message flow di SD-4.
   */
  async generateReport(simulationId: string): Promise<string> {
    const admin = createAdminClient();

    // SD-4 step 1: Ambil data simulasi (SimulationHistory.getById)
    const { data: sim } = await admin
      .from("simulation_history")
      .select("*")
      .eq("id", simulationId)
      .single();

    if (!sim) throw new Error("Simulasi tidak ditemukan.");

    // Fetch province name
    let provinceName = "Indonesia";
    if (sim.province_id) {
      const { data: province } = await admin
        .from("provinces")
        .select("name")
        .eq("id", sim.province_id)
        .single();
      if (province) provinceName = province.name;
    }

    const outputResults = sim.output_results as unknown as Record<string, unknown>;
    const inputParams = sim.input_params as unknown as Record<string, number>;

    // Build report data
    const reportData: SimulationReportData = {
      simulationId,
      provinceName,
      year: 2024,
      inputParams,
      predictedCategory: (outputResults.predictedCategory as string) ?? "Sedang",
      pRendah: (outputResults.pRendah as number) ?? 0.33,
      pSedang: (outputResults.pSedang as number) ?? 0.34,
      pTinggi: (outputResults.pTinggi as number) ?? 0.33,
      significantVars: [],
      changedVariables: [],
    };

    // SD-4 step 2-4: 3x LLM calls ke Claude API (parallel)
    const interpretationData = {
      ...reportData,
      beforeCategory: reportData.predictedCategory,
      afterCategory: reportData.predictedCategory,
    };

    const [summary, interpretation, recommendation] = await Promise.all([
      generateText(SYSTEM_PROMPT, buildSummaryPrompt(reportData)),
      generateText(SYSTEM_PROMPT, buildInterpretationPrompt(interpretationData)),
      generateText(SYSTEM_PROMPT, buildRecommendationPrompt(reportData)),
    ]);

    const content: ReportContent = { summary, interpretation, recommendation };

    // SD-4 step 5: compilePDF (self-delegation)
    const pdfBuffer = await compilePDF(content, reportData);

    // SD-4 step 6: Simpan ke Supabase Storage
    const fileName = `reports/${simulationId}-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("reports")
      .upload(fileName, pdfBuffer, { contentType: "application/pdf" });

    if (uploadError) throw new Error("Gagal menyimpan PDF.");

    const { data: publicUrl } = admin.storage
      .from("reports")
      .getPublicUrl(fileName);

    const downloadUrl = publicUrl.publicUrl;

    // SD-4 step 7: Update SimulationHistory (saveReportUrl)
    await admin
      .from("simulation_history")
      .update({ report_pdf_url: downloadUrl })
      .eq("id", simulationId);

    return downloadUrl;
  }
}
