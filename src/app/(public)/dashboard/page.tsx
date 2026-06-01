import { redirect } from "next/navigation";

/**
 * The dashboard split into `/data` (Potret Stunting) and `/prediksi` (simulator
 * + model). This legacy path now redirects to `/data` so old links keep working.
 */
export default function DashboardPage() {
  redirect("/data");
}
