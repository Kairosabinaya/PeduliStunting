/** Admin Analytics — grafik simulasi per hari dan registrasi per bulan. */
"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalyticsData } from "../actions";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    simulationsPerDay: { date: string; count: number }[];
    usersPerMonth: { month: string; count: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAnalyticsData().then((d) => {
      setData(d);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
        <div className="space-y-6">
          <div className="h-64 bg-primary-100 animate-pulse rounded-xl" />
          <div className="h-64 bg-primary-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>

      {/* Simulations per day */}
      <div className="rounded-xl border border-primary-200 bg-white p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Simulasi per Hari (30 hari terakhir)</h2>
        {data && data.simulationsPerDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.simulationsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} name="Simulasi" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-foreground/40 text-sm py-8 text-center">Belum ada data simulasi.</p>
        )}
      </div>

      {/* Users per month */}
      <div className="rounded-xl border border-primary-200 bg-white p-5">
        <h2 className="text-lg font-semibold mb-4">Registrasi per Bulan (6 bulan terakhir)</h2>
        {data && data.usersPerMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.usersPerMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} name="User Baru" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-foreground/40 text-sm py-8 text-center">Belum ada data registrasi.</p>
        )}
      </div>
    </div>
  );
}
