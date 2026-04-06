/** Auth callback route — exchanges OAuth code for session after Google login. */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/simulasi";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Send welcome email for new users (non-blocking)
      const meta = data.user.user_metadata;
      sendWelcomeEmail(
        data.user.email ?? "",
        (meta?.full_name as string) ?? (meta?.name as string) ?? ""
      );
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
