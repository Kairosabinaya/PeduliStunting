/** Server actions for dataset upload — validate, store, and create job. */
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_UPLOAD_FILE_SIZE_MB } from "@/lib/constants";
import type { ModelType } from "@/types/database";

interface UploadResult {
  success: boolean;
  error?: string;
  jobId?: string;
}

/** UploadJob.validate() + UploadJob.create() — validate file and create processing job. */
export async function uploadDataset(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Anda harus login." };

  // Check premium role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (!profile || profile.role === "free") {
    return { success: false, error: "Fitur ini hanya tersedia untuk pengguna Premium." };
  }

  const file = formData.get("file") as File | null;
  const modelType = (formData.get("modelType") as ModelType) || "GTWENOLR";

  if (!file) return { success: false, error: "File tidak ditemukan." };

  // Validate file type
  const allowedTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
    return { success: false, error: "Format file harus CSV atau Excel (.xlsx)." };
  }

  // Validate file size
  const maxSizeBytes = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { success: false, error: `Ukuran file maksimal ${MAX_UPLOAD_FILE_SIZE_MB} MB.` };
  }

  const admin = createAdminClient();

  // Upload to Supabase Storage
  const fileName = `uploads/${user.id}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("datasets")
    .upload(fileName, buffer, { contentType: file.type });

  if (uploadError) {
    return { success: false, error: "Gagal mengupload file. Silakan coba lagi." };
  }

  const { data: publicUrl } = admin.storage
    .from("datasets")
    .getPublicUrl(fileName);

  // Create upload job
  const { data: job, error: jobError } = await admin
    .from("upload_jobs")
    .insert({
      user_id: user.id,
      file_url: publicUrl.publicUrl,
      file_name: file.name,
      status: "queued",
      model_type: modelType,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return { success: false, error: "Gagal membuat job processing." };
  }

  // TODO: Trigger R Service on Google Cloud Run when available
  // For now, simulate processing after a delay
  simulateProcessing(job.id);

  return { success: true, jobId: job.id };
}

/** Placeholder: simulate R Service processing (will be replaced with actual Cloud Run call). */
async function simulateProcessing(jobId: string) {
  const admin = createAdminClient();

  // Mark as processing
  await admin
    .from("upload_jobs")
    .update({ status: "processing" })
    .eq("id", jobId);

  // Simulate delay then complete
  setTimeout(async () => {
    await admin
      .from("upload_jobs")
      .update({
        status: "complete",
        result_data: { message: "Processing simulated — R Service belum aktif." },
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }, 5000);
}
