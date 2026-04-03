/** Server actions for account management — subscription checkout and profile. */
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSnapToken } from "@/lib/payment/midtrans";
import type { SubscriptionTier } from "@/types/database";

const TIER_PRICES: Record<SubscriptionTier, number> = {
  profesional: 49000,
  institusi: 149000,
};

/** AkunPage.pilihTier() — create Midtrans Snap token for checkout. */
export async function createCheckout(
  tier: SubscriptionTier
): Promise<{ snapToken: string; orderId: string } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Anda harus login." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single<{ name: string; email: string }>();

  if (!profile) return { error: "Profil tidak ditemukan." };

  const amount = TIER_PRICES[tier];
  const orderId = `PS-${tier.toUpperCase()}-${Date.now()}`;

  // Create pending subscription using admin client (bypasses RLS for insert)
  const admin = createAdminClient();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const { data: subscription, error: subError } = await admin
    .from("subscriptions")
    .insert({
      user_id: user.id,
      tier,
      status: "expired", // will be activated by webhook
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      midtrans_sub_id: orderId,
    })
    .select("id")
    .single();

  if (subError || !subscription) {
    return { error: "Gagal membuat subscription." };
  }

  // Create pending payment
  await admin.from("payments").insert({
    subscription_id: subscription.id,
    amount,
    status: "pending",
    midtrans_id: orderId,
  });

  const snapToken = await createSnapToken({
    orderId,
    amount,
    customerName: profile.name || "User",
    customerEmail: profile.email,
    tierName: tier.charAt(0).toUpperCase() + tier.slice(1),
  });

  return { snapToken, orderId };
}

/** Get current subscription status for the user. */
export async function getSubscriptionStatus() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return subscription;
}

/** Get payment history for the user. */
export async function getPaymentHistory() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id);

  if (!subscriptions || subscriptions.length === 0) return [];

  const subIds = subscriptions.map((s) => s.id);
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .in("subscription_id", subIds)
    .order("created_at", { ascending: false });

  return payments ?? [];
}

/** Get user profile. */
export async function getUserProfile() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
