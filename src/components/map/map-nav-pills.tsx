/** MapNavPills — compact floating navigation overlay for the map page (top-right). */
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface MapNavPillsProps {
  user: User | null;
}

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/peta", label: "Peta" },
  { href: "/harga", label: "Harga" },
] as const;

export function MapNavPills({ user }: MapNavPillsProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-md border border-gray-100 px-1.5 py-1.5 gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
              link.href === "/peta"
                ? "bg-primary-600 text-white"
                : "text-foreground/60 hover:text-foreground hover:bg-gray-50"
            )}
          >
            {link.label}
          </Link>
        ))}

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {user ? (
          <Link
            href="/dashboard/simulasi"
            className="px-3.5 py-1.5 rounded-full text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            Masuk
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-md border border-gray-100"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5 text-foreground/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
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

        {mobileOpen && (
          <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 py-2 w-44">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2 text-sm font-medium transition-colors",
                  link.href === "/peta"
                    ? "text-primary-600 bg-primary-50"
                    : "text-foreground/70 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              {user ? (
                <Link
                  href="/dashboard/simulasi"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-primary-600"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
