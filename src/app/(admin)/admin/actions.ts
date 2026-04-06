/** Server actions for admin panel — statistics, user management, data operations. */
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ---- Dashboard Stats ----

export async function getAdminStats() {
  const admin = createAdminClient();

  const [users, subs, sims, articles] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("simulation_history").select("id", { count: "exact", head: true }),
    admin.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  return {
    totalUsers: users.count ?? 0,
    activeSubscriptions: subs.count ?? 0,
    totalSimulations: sims.count ?? 0,
    publishedArticles: articles.count ?? 0,
  };
}

// ---- User Management ----

export async function getUsers(search?: string, roleFilter?: string) {
  const admin = createAdminClient();
  let query = admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (roleFilter && roleFilter !== "all") {
    query = query.eq("role", roleFilter as "free" | "premium" | "admin");
  }

  const { data } = await query;
  return data ?? [];
}

export async function updateUserRole(userId: string, role: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role: role as "free" | "premium" | "admin" }).eq("id", userId);
  return { success: !error, error: error?.message };
}

// ---- Article CMS ----

export async function getArticles() {
  const admin = createAdminClient();
  const { data } = await admin.from("articles").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function createArticle(formData: { title: string; slug: string; content: string; excerpt: string; category: string; status: "draft" | "published" }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();
  const { data, error } = await admin.from("articles").insert({
    ...formData,
    author_id: user.id,
    published_at: formData.status === "published" ? new Date().toISOString() : null,
  }).select("id").single();

  return { success: !error, id: data?.id, error: error?.message };
}

export async function updateArticle(id: string, formData: { title?: string; slug?: string; content?: string; excerpt?: string; category?: string; status?: "draft" | "published" }) {
  const admin = createAdminClient();
  const updateData: Record<string, unknown> = { ...formData };
  if (formData.status === "published") {
    updateData.published_at = new Date().toISOString();
  }
  const { error } = await admin.from("articles").update(updateData).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function deleteArticle(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("articles").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ---- Facts CRUD ----

export async function getFacts() {
  const admin = createAdminClient();
  const { data } = await admin.from("facts").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function createFact(formData: { content: string; source?: string; category?: string; province_id?: number | null }) {
  const admin = createAdminClient();
  const { error } = await admin.from("facts").insert(formData);
  return { success: !error, error: error?.message };
}

export async function updateFact(id: string, formData: { content?: string; source?: string; category?: string; province_id?: number | null; is_active?: boolean }) {
  const admin = createAdminClient();
  const { error } = await admin.from("facts").update(formData).eq("id", id);
  return { success: !error, error: error?.message };
}

export async function deleteFact(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("facts").delete().eq("id", id);
  return { success: !error, error: error?.message };
}

// ---- Dataset Import (SD-7) ----

export async function importDataset(formData: FormData) {
  const admin = createAdminClient();
  const year = Number(formData.get("year"));
  const dataJson = formData.get("data") as string;

  if (!year || !dataJson) return { success: false, error: "Tahun dan data diperlukan." };

  try {
    const rows = JSON.parse(dataJson) as Record<string, unknown>[];

    for (const row of rows) {
      const provinceId = Number(row.province_id);
      if (!provinceId) continue;

      // Upsert stunting_data
      if (row.prevalence_rate !== undefined) {
        await admin.from("stunting_data").upsert({
          province_id: provinceId,
          year,
          prevalence_rate: Number(row.prevalence_rate),
          category: row.category as "Rendah" | "Sedang" | "Tinggi",
        }, { onConflict: "province_id,year" });
      }

      // Upsert predictor_data
      const predictorFields: Record<string, unknown> = { province_id: provinceId, year };
      for (const [key, val] of Object.entries(row)) {
        if (key.startsWith("x") && key.match(/^x\d/)) {
          predictorFields[key] = val !== null ? Number(val) : null;
        }
      }
      if (Object.keys(predictorFields).length > 2) {
        // Cast needed because dynamic field construction doesn't match strict insert type
        await (admin.from("predictor_data") as unknown as { upsert: (v: Record<string, unknown>, o: { onConflict: string }) => Promise<unknown> })
          .upsert(predictorFields, { onConflict: "province_id,year" });
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Import gagal." };
  }
}

// ---- Analytics ----

export async function getAnalyticsData() {
  const admin = createAdminClient();

  // Simulations per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentSims } = await admin
    .from("simulation_history")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at");

  const simsByDay = new Map<string, number>();
  for (const s of recentSims ?? []) {
    const day = s.created_at.slice(0, 10);
    simsByDay.set(day, (simsByDay.get(day) ?? 0) + 1);
  }

  // Users per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: recentUsers } = await admin
    .from("profiles")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at");

  const usersByMonth = new Map<string, number>();
  for (const u of recentUsers ?? []) {
    const month = u.created_at.slice(0, 7);
    usersByMonth.set(month, (usersByMonth.get(month) ?? 0) + 1);
  }

  return {
    simulationsPerDay: Array.from(simsByDay, ([date, count]) => ({ date, count })),
    usersPerMonth: Array.from(usersByMonth, ([month, count]) => ({ month, count })),
  };
}
