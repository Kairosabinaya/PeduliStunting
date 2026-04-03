/** Dashboard layout — authenticated shell with sidebar navigation. */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

const DASHBOARD_NAV = [
  { href: "/dashboard/simulasi", label: "Simulasi Provinsi" },
  { href: "/dashboard/simulasi-nasional", label: "Simulasi Nasional" },
  { href: "/dashboard/upload", label: "Upload Dataset" },
  { href: "/dashboard/riwayat", label: "Riwayat" },
  { href: "/dashboard/akun", label: "Akun" },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar — hidden on mobile */}
          <aside className="hidden md:block w-56 shrink-0">
            <nav className="space-y-1 sticky top-24">
              {DASHBOARD_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-foreground/60 hover:text-foreground hover:bg-primary-50/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Mobile nav tabs */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-1 min-w-max pb-2">
              {DASHBOARD_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-foreground/60 hover:bg-primary-50/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
