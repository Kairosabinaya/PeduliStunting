/**
 * AkunPage — Boundary class untuk halaman akun/profil.
 * Menampilkan profil user, status subscription, dan history payment.
 * pilihTier() → createCheckout() → Midtrans Snap popup.
 */
"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import {
  createCheckout,
  getSubscriptionStatus,
  getPaymentHistory,
  getUserProfile,
} from "./actions";
import type { SubscriptionTier } from "@/types/database";
import { cn } from "@/lib/utils";

const TIERS: { tier: SubscriptionTier; name: string; price: number }[] = [
  { tier: "profesional", name: "Profesional", price: 49000 },
  { tier: "institusi", name: "Institusi", price: 149000 },
];

export default function AkunPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [p, s, pay] = await Promise.all([
        getUserProfile(),
        getSubscriptionStatus(),
        getPaymentHistory(),
      ]);
      setProfile(p);
      setSubscription(s);
      setPayments(pay);
      setIsLoading(false);
    }
    loadData();
  }, []);

  /** AkunPage.pilihTier() — initiate payment via Midtrans Snap. */
  async function handleUpgrade(tier: SubscriptionTier) {
    setCheckoutLoading(true);
    setMessage(null);

    const result = await createCheckout(tier);

    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      setCheckoutLoading(false);
      return;
    }

    // Open Midtrans Snap popup
    const w = window as unknown as { snap?: { pay: (token: string, callbacks: Record<string, unknown>) => void } };
    if (w.snap) {
      w.snap.pay(result.snapToken, {
        onSuccess: () => {
          setMessage({ type: "success", text: "Pembayaran berhasil! Subscription Anda telah diaktifkan." });
          setCheckoutLoading(false);
          // Reload subscription status
          getSubscriptionStatus().then(setSubscription);
          getPaymentHistory().then(setPayments);
        },
        onPending: () => {
          setMessage({ type: "success", text: "Pembayaran sedang diproses. Anda akan mendapat notifikasi." });
          setCheckoutLoading(false);
        },
        onError: () => {
          setMessage({ type: "error", text: "Pembayaran gagal. Silakan coba lagi." });
          setCheckoutLoading(false);
        },
        onClose: () => {
          setCheckoutLoading(false);
        },
      });
    } else {
      setMessage({ type: "error", text: "Midtrans belum dimuat. Silakan refresh halaman." });
      setCheckoutLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Akun Saya</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-primary-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isActive = subscription && (subscription as Record<string, unknown>).status === "active";
  const currentTier = isActive ? (subscription as Record<string, unknown>).tier as string : "free";

  return (
    <>
      {/* Midtrans Snap script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div>
        <h1 className="text-2xl font-semibold mb-6">Akun Saya</h1>

        {message && (
          <div className={cn(
            "rounded-lg p-4 mb-6 text-sm",
            message.type === "success" ? "bg-primary-50 text-primary-700" : "bg-accent-50 text-accent-600"
          )}>
            {message.text}
          </div>
        )}

        {/* Profile */}
        <div className="rounded-xl border border-primary-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profil</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-foreground/50">Nama</span>
              <p className="font-medium">{(profile as Record<string, unknown>)?.name as string || "-"}</p>
            </div>
            <div>
              <span className="text-foreground/50">Email</span>
              <p className="font-medium">{(profile as Record<string, unknown>)?.email as string || "-"}</p>
            </div>
            <div>
              <span className="text-foreground/50">Role</span>
              <p className="font-medium capitalize">{(profile as Record<string, unknown>)?.role as string || "free"}</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="rounded-xl border border-primary-200 bg-white p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Status Subscription</h2>
          {isActive ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stunting-rendah" />
                <span className="font-medium text-stunting-rendah">Aktif</span>
                <span className="text-foreground/50">— Paket {(subscription as Record<string, unknown>).tier as string}</span>
              </div>
              <p className="text-foreground/50">
                Berlaku hingga:{" "}
                {new Date((subscription as Record<string, unknown>).expires_at as string).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          ) : (
            <p className="text-foreground/50 text-sm">
              Anda menggunakan paket Free. Upgrade untuk akses fitur premium.
            </p>
          )}
        </div>

        {/* Upgrade options */}
        {currentTier === "free" && (
          <div className="rounded-xl border border-primary-200 bg-white p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Upgrade Paket</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {TIERS.map((t) => (
                <div key={t.tier} className="rounded-lg border border-primary-200 p-4">
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-2xl font-bold mt-1">
                    Rp{t.price.toLocaleString("id-ID")}
                    <span className="text-sm font-normal text-foreground/50">/bulan</span>
                  </p>
                  <button
                    onClick={() => handleUpgrade(t.tier)}
                    disabled={checkoutLoading}
                    type="button"
                    className="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {checkoutLoading ? "Memproses..." : "Langganan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="rounded-xl border border-primary-200 bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Riwayat Pembayaran</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-foreground/50 border-b border-primary-100">
                    <th className="pb-2 pr-4">Tanggal</th>
                    <th className="pb-2 pr-4">Jumlah</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Metode</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id as string} className="border-b border-primary-50">
                      <td className="py-2 pr-4">
                        {new Date(p.created_at as string).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-2 pr-4">
                        Rp{Number(p.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          p.status === "success" ? "bg-green-50 text-green-700" :
                          p.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          "bg-red-50 text-red-700"
                        )}>
                          {p.status as string}
                        </span>
                      </td>
                      <td className="py-2">{(p.payment_method as string) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
