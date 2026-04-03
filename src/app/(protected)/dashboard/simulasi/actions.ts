/** Server actions for simulation history — save results and check daily count. */
"use server";

import { createClient } from "@/lib/supabase/server";
import { MAX_FREE_SIMULATIONS_PER_DAY } from "@/lib/constants";
import type { PredictionResult, SimulationType } from "@/types/database";

interface SaveSimulationInput {
  type: SimulationType;
  provinceId: number | null;
  inputParams: Record<string, number>;
  outputResults: PredictionResult;
}

export async function saveSimulation(
  data: SaveSimulationInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Anda harus login untuk menyimpan simulasi." };
  }

  // Check free tier limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (profile?.role === "free") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("simulation_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString());

    if ((count ?? 0) >= MAX_FREE_SIMULATIONS_PER_DAY) {
      return {
        success: false,
        error: `Batas simulasi harian tercapai (${MAX_FREE_SIMULATIONS_PER_DAY}/hari). Upgrade ke Premium untuk simulasi tanpa batas.`,
      };
    }
  }

  const { data: result, error } = await supabase
    .from("simulation_history")
    .insert({
      user_id: user.id,
      type: data.type,
      province_id: data.provinceId,
      input_params: data.inputParams,
      output_results: data.outputResults as unknown as Record<string, unknown>,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: "Gagal menyimpan simulasi. Silakan coba lagi." };
  }

  return { success: true, id: result.id };
}

export async function getSimulationCount(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("simulation_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  return count ?? 0;
}
