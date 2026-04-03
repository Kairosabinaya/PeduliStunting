/**
 * Header — responsive navigation with logo, nav links, and auth buttons.
 * Mobile: hamburger menu. Desktop: horizontal nav.
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/peta", label: "Peta" },
  { href: "/harga", label: "Harga" },
] as const;

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-primary-600">
              PeduliStunting
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-foreground/70 hover:text-foreground hover:bg-primary-50/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard/simulasi"
                  className="px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:bg-primary-50"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-50 text-primary-700"
                    : "text-foreground/70 hover:bg-primary-50/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-primary-100">
              {user ? (
                <>
                  <Link
                    href="/dashboard/simulasi"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-foreground/60 hover:bg-primary-50/50"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-600"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
