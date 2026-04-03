/** Server action for generating PDF report — premium users only. */
"use server";

import { createClient } from "@/lib/supabase/server";
import { ReportService } from "@/lib/report/service";

export async function generateReport(
  simulationId: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Anda harus login." };

  // Check premium role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (!profile || profile.role === "free") {
    return { error: "Fitur ini hanya tersedia untuk pengguna Premium." };
  }

  try {
    const service = new ReportService();
    const url = await service.generateReport(simulationId);
    return { url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat report.";
    return { error: message };
  }
}
