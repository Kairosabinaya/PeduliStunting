/** Halaman Login — email/password dan Google OAuth. */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard/simulasi";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Cek email Anda untuk konfirmasi akun.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirectTo);
      }
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="text-3xl font-bold text-primary-600">
          PeduliStunting
        </Link>
        <h2 className="mt-4 text-xl font-semibold">
          {isSignUp ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
        </h2>
      </div>

      {error && (
        <div className="rounded-lg bg-accent-50 p-4 text-sm text-accent-600">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg bg-primary-50 p-4 text-sm text-primary-700">
          {message}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-primary-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              placeholder="Nama lengkap Anda"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-primary-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            placeholder="email@contoh.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-primary-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? "Memproses..."
            : isSignUp
              ? "Daftar"
              : "Masuk"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-primary-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-foreground/50">atau</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 font-medium hover:bg-primary-50 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-colors"
      >
        Masuk dengan Google
      </button>

      <p className="text-center text-sm text-foreground/60">
        {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
          type="button"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          {isSignUp ? "Masuk" : "Daftar"}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
