/** Admin Users — tabel user dengan search, filter role, edit role. */
"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, updateUserRole } from "../actions";
import { cn } from "@/lib/utils";

const ROLES = ["all", "free", "premium", "admin"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    const data = await getUsers(search || undefined, roleFilter);
    setUsers(data);
    setIsLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(userId: string, newRole: string) {
    await updateUserRole(userId, newRole);
    loadUsers();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Manajemen User</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <div className="flex gap-1">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              type="button"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                roleFilter === r ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-700 hover:bg-primary-100"
              )}
            >
              {r === "all" ? "Semua" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-primary-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-50 text-left">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Terdaftar</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id as string} className="border-t border-primary-100">
                  <td className="px-4 py-3 font-medium">{u.name as string || "-"}</td>
                  <td className="px-4 py-3 text-foreground/60">{u.email as string}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                      u.role === "admin" ? "bg-purple-50 text-purple-700" :
                      u.role === "premium" ? "bg-primary-50 text-primary-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {u.role as string}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/50">
                    {new Date(u.created_at as string).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role as string}
                      onChange={(e) => handleRoleChange(u.id as string, e.target.value)}
                      className="rounded border border-primary-200 px-2 py-1 text-xs"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-foreground/40">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
