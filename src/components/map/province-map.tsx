/** ProvinceMap — Leaflet map with circle markers for 34 Indonesian provinces. */
"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { getStuntingGradientColor } from "@/lib/stunting-color";
import type { StuntingCategory } from "@/types/database";
import "leaflet/dist/leaflet.css";

interface StuntingEntry {
  prevalenceRate: number;
  category: StuntingCategory;
}

interface ProvincePoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface ProvinceMapProps {
  provinces: ProvincePoint[];
  stuntingData: Map<number, StuntingEntry>;
  selectedProvinceId?: number | null;
  onProvinceClick?: (provinceId: number) => void;
  interactive?: boolean;
}

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const DEFAULT_ZOOM = 5;

/** Radius titik berdasarkan prevalensi (semakin tinggi = semakin besar) */
function getRadius(entry: StuntingEntry | undefined): number {
  if (!entry) return 6;
  const base = 6;
  const scale = entry.prevalenceRate / 10;
  return Math.min(base + scale, 16);
}

export default function ProvinceMap({
  provinces,
  stuntingData,
  selectedProvinceId,
  onProvinceClick,
  interactive = true,
}: ProvinceMapProps) {
  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={INDONESIA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {provinces.map((province) => {
          const entry = stuntingData.get(province.id);
          const isSelected = province.id === selectedProvinceId;

          return (
            <CircleMarker
              key={province.id}
              center={[province.latitude, province.longitude]}
              radius={isSelected ? getRadius(entry) + 3 : getRadius(entry)}
              pathOptions={{
                fillColor: getStuntingGradientColor(entry?.prevalenceRate),
                fillOpacity: isSelected ? 1 : 0.85,
                color: isSelected ? "#0D9488" : "#fff",
                weight: isSelected ? 3 : 2,
                opacity: 1,
              }}
              eventHandlers={
                interactive && onProvinceClick
                  ? {
                      click: () => onProvinceClick(province.id),
                    }
                  : undefined
              }
            >
              <Tooltip sticky>
                <span>
                  <strong>{province.name}</strong>
                  <br />
                  {entry ? (
                    <>
                      Prevalensi: {entry.prevalenceRate.toFixed(1)}%
                      <br />
                      Kategori: {entry.category}
                    </>
                  ) : (
                    "Data belum tersedia"
                  )}
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
