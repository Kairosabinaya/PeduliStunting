/** ProvinceMap — Leaflet choropleth map for 34 Indonesian provinces. */
"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { STUNTING_COLORS } from "@/lib/constants";
import { MapLegend } from "./map-legend";
import type { StuntingCategory } from "@/types/database";
import "leaflet/dist/leaflet.css";

interface StuntingEntry {
  prevalenceRate: number;
  category: StuntingCategory;
}

interface ProvinceMapProps {
  geojsonData: GeoJsonObject | null;
  stuntingData: Map<number, StuntingEntry>;
  selectedProvinceId?: number | null;
  onProvinceClick?: (provinceId: number) => void;
  interactive?: boolean;
}

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const DEFAULT_ZOOM = 5;

function getColor(category: StuntingCategory | undefined): string {
  if (!category) return "#D1D5DB";
  return STUNTING_COLORS[category];
}

export default function ProvinceMap({
  geojsonData,
  stuntingData,
  selectedProvinceId,
  onProvinceClick,
  interactive = true,
}: ProvinceMapProps) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const style = (feature: GeoJSON.Feature | undefined): PathOptions => {
    const id = feature?.properties?.id as number;
    const entry = stuntingData.get(id);
    const isSelected = id === selectedProvinceId;

    return {
      fillColor: getColor(entry?.category),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? "#0D9488" : "#fff",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: Layer) => {
    const id = feature.properties?.id as number;
    const name = feature.properties?.name as string;
    const entry = stuntingData.get(id);

    const tooltipContent = entry
      ? `<strong>${name}</strong><br/>Prevalensi: ${entry.prevalenceRate.toFixed(1)}%<br/>Kategori: ${entry.category}`
      : `<strong>${name}</strong><br/>Data belum tersedia`;

    layer.bindTooltip(tooltipContent, { sticky: true });

    if (interactive && onProvinceClick) {
      layer.on("click", () => onProvinceClick(id));
      layer.on("mouseover", () => {
        (layer as L.Path).setStyle({ fillOpacity: 0.9, weight: 2 });
      });
      layer.on("mouseout", () => {
        geoJsonRef.current?.resetStyle(layer);
      });
    }
  };

  // Reset styles when stuntingData or selectedProvinceId changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle((feature) => style(feature as GeoJSON.Feature));
    }
  });

  if (!geojsonData) {
    return (
      <div className="w-full h-full bg-primary-50 flex items-center justify-center rounded-lg">
        <p className="text-foreground/50">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={INDONESIA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-lg z-0"
        scrollWheelZoom={true}
        style={{ minHeight: "400px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          ref={geoJsonRef}
          data={geojsonData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000]">
        <MapLegend />
      </div>
    </div>
  );
}
