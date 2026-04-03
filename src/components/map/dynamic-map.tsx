/** Dynamic map wrapper — imports ProvinceMap with ssr: false for Leaflet compatibility. */
"use client";

import dynamic from "next/dynamic";

const ProvinceMap = dynamic(() => import("./province-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-primary-50 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-foreground/40">Memuat peta...</p>
    </div>
  ),
});

export default ProvinceMap;
