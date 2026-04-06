/** Email service — send transactional emails via Resend. */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = "PeduliStunting <noreply@pedulistunting.id>";

/** Send welcome email after registration. */
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Selamat Datang di PeduliStunting.id!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0D9488;">Selamat Datang, ${name || "User"}!</h1>
          <p>Terima kasih telah bergabung dengan PeduliStunting.id.</p>
          <p>Dengan akun Anda, Anda dapat:</p>
          <ul>
            <li>Menjelajahi peta interaktif stunting Indonesia</li>
            <li>Menjalankan simulasi kebijakan per-provinsi</li>
            <li>Menyimpan riwayat simulasi</li>
          </ul>
          <p>Upgrade ke Premium untuk akses fitur lengkap termasuk report PDF profesional dan upload dataset custom.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/simulasi" style="display: inline-block; background: #0D9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Mulai Simulasi</a></p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">PeduliStunting.id — Platform edukasi stunting dan simulasi kebijakan untuk Indonesia.</p>
        </div>
      `,
    });
  } catch {
    // Silently fail — email is non-critical
    console.error("Failed to send welcome email to", to);
  }
}

/** Send notification when dataset upload processing is complete. */
export async function sendUploadCompleteEmail(
  to: string,
  name: string,
  fileName: string,
  status: "complete" | "failed",
  errorMessage?: string
) {
  try {
    const isSuccess = status === "complete";
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: isSuccess
        ? `Dataset "${fileName}" Selesai Diproses`
        : `Dataset "${fileName}" Gagal Diproses`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${isSuccess ? "#0D9488" : "#EF4444"};">
            ${isSuccess ? "Processing Selesai!" : "Processing Gagal"}
          </h1>
          <p>Halo ${name || "User"},</p>
          <p>Dataset <strong>${fileName}</strong> Anda telah ${isSuccess ? "selesai diproses" : "gagal diproses"}.</p>
          ${errorMessage ? `<p style="color: #EF4444;">Error: ${errorMessage}</p>` : ""}
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/riwayat" style="display: inline-block; background: #0D9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Lihat Hasil</a></p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">PeduliStunting.id</p>
        </div>
      `,
    });
  } catch {
    console.error("Failed to send upload email to", to);
  }
}
