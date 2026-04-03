/** Halaman Riwayat — menampilkan riwayat simulasi dan upload jobs user. */
import { createClient } from "@/lib/supabase/server";
import { STUNTING_COLORS } from "@/lib/constants";
import Link from "next/link";

export default async function RiwayatPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch simulation history
  const { data: simulations } = await supabase
    .from("simulation_history")
    .select("id, type, province_id, output_results, report_pdf_url, created_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch province names for display
  const { data: provinceList } = await supabase
    .from("provinces")
    .select("id, name");
  const provinceMap = new Map((provinceList ?? []).map((p) => [p.id, p.name]));

  // Fetch upload jobs
  const { data: uploads } = await supabase
    .from("upload_jobs")
    .select("id, file_name, status, model_type, created_at, completed_at")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Riwayat</h1>

      {/* Simulation History */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Riwayat Simulasi</h2>
        {simulations && simulations.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-primary-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 text-left">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium">Provinsi</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Report</th>
                </tr>
              </thead>
              <tbody>
                {simulations.map((sim) => {
                  const output = sim.output_results as unknown as Record<string, unknown>;
                  const category = (output?.predictedCategory as string) ?? "-";
                  const color = STUNTING_COLORS[category as keyof typeof STUNTING_COLORS];
                  const provinceName = sim.province_id ? provinceMap.get(sim.province_id) : null;

                  return (
                    <tr key={sim.id} className="border-t border-primary-100">
                      <td className="px-4 py-3">
                        {new Date(sim.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 capitalize">{sim.type}</td>
                      <td className="px-4 py-3">{provinceName ?? "Nasional"}</td>
                      <td className="px-4 py-3">
                        {color ? (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: color }}
                          >
                            {category}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sim.report_pdf_url ? (
                          <Link
                            href={sim.report_pdf_url}
                            target="_blank"
                            className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                          >
                            Download PDF
                          </Link>
                        ) : (
                          <span className="text-foreground/30 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-foreground/50 text-sm">Belum ada riwayat simulasi.</p>
        )}
      </div>

      {/* Upload Jobs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Riwayat Upload Dataset</h2>
        {uploads && uploads.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-primary-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 text-left">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">File</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((job) => (
                  <tr key={job.id} className="border-t border-primary-100">
                    <td className="px-4 py-3">
                      {new Date(job.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">{job.file_name}</td>
                    <td className="px-4 py-3 text-xs">{job.model_type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "complete" ? "bg-green-50 text-green-700" :
                        job.status === "processing" ? "bg-yellow-50 text-yellow-700" :
                        job.status === "queued" ? "bg-blue-50 text-blue-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-foreground/50 text-sm">Belum ada riwayat upload.</p>
        )}
      </div>
    </div>
  );
}
