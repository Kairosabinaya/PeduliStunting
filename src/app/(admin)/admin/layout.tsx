/** Admin layout — admin shell with sidebar navigation. */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/artikel", label: "Artikel" },
  { href: "/admin/facts", label: "Facts" },
  { href: "/admin/dataset", label: "Dataset" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-primary-700">
            Admin Panel
          </h1>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-48 shrink-0">
            <nav className="space-y-1 sticky top-24">
              {ADMIN_NAV.map((item) => (
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

          {/* Mobile tabs */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-1 min-w-max pb-2">
              {ADMIN_NAV.map((item) => (
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
