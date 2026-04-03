/**
 * Midtrans payment webhook handler.
 * Receives payment notifications, verifies signature, activates subscriptions.
 * Sesuai dengan SD-5 flow dan Section 14.3 (Payment Security).
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySignature } from "@/lib/payment/midtrans";

interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
}

export async function POST(request: Request) {
  let body: MidtransNotification;
  try {
    body = (await request.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify webhook signature
  const isValid = verifySignature(
    body.order_id,
    body.status_code,
    body.gross_amount,
    process.env.MIDTRANS_SERVER_KEY!,
    body.signature_key
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Find payment by midtrans_id (order_id)
  const { data: payment } = await admin
    .from("payments")
    .select("id, subscription_id, status")
    .eq("midtrans_id", body.order_id)
    .single();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Idempotency: skip if already processed
  if (payment.status === "success") {
    return NextResponse.json({ status: "already_processed" });
  }

  const transactionStatus = body.transaction_status;
  const fraudStatus = body.fraud_status;

  if (
    transactionStatus === "capture" ||
    transactionStatus === "settlement"
  ) {
    if (fraudStatus === "challenge") {
      // Payment needs review — keep pending
      return NextResponse.json({ status: "pending_review" });
    }

    // Payment.create() — update payment status to success
    await admin
      .from("payments")
      .update({
        status: "success",
        payment_method: body.payment_type ?? null,
      })
      .eq("id", payment.id);

    // Subscription.activate() — activate the subscription
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await admin
      .from("subscriptions")
      .update({
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", payment.subscription_id);

    // Update user role to premium
    const { data: sub } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("id", payment.subscription_id)
      .single();

    if (sub) {
      await admin
        .from("profiles")
        .update({ role: "premium" })
        .eq("id", sub.user_id);
    }
  } else if (
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire"
  ) {
    // Payment failed
    await admin
      .from("payments")
      .update({ status: "failed" })
      .eq("id", payment.id);

    await admin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", payment.subscription_id);
  }

  return NextResponse.json({ status: "ok" });
}
