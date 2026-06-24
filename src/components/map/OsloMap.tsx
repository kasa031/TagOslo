"use client";

import { useEffect, useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import type { MapPinSummary } from "@/types";
import type { SunCondition } from "@/types/sol";
import { OSLO_CENTER } from "@/lib/constants";
import { useMapboxToken } from "@/hooks/useMapboxToken";
import { MapboxSetupNotice } from "@/components/map/MapboxSetupNotice";

type OsloMapProps = {
  pins: MapPinSummary[];
  sunConditions: Record<string, SunCondition>;
  selectedPinId: string | null;
  flyTo: { lat: number; lng: number } | null;
  onPinSelect: (pin: MapPinSummary) => void;
  onMapClick: (lat: number, lng: number) => void;
  addPinMode?: boolean;
};

const categoryColors: Record<string, string> = {
  UTESTED: "#c8102e",
  SPISESTED: "#004f9f",
  BYGNING: "#5c6478",
  PARK: "#2d6a4f",
  ANNET: "#6b7280",
};

export function OsloMap({
  pins,
  sunConditions,
  selectedPinId,
  flyTo,
  onPinSelect,
  onMapClick,
  addPinMode = false,
}: OsloMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { token, loading } = useMapboxToken();

  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: 15,
        duration: 1200,
      });
    }
  }, [flyTo]);

  if (loading) {
    return (
      <div className="flex h-[60vh] min-h-[400px] items-center justify-center rounded-2xl border border-oslo-border bg-oslo-blue-light">
        <p className="text-sm text-oslo-muted">Laster kart …</p>
      </div>
    );
  }

  if (!token) {
    return <MapboxSetupNotice />;
  }

  return (
    <div className="relative h-[60vh] min-h-[400px] overflow-hidden rounded-2xl border border-oslo-border shadow-sm">
      {addPinMode && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-oslo-blue/90 px-3 py-2 text-center text-xs font-bold text-white">
          Trykk på kartet for å plassere nytt sted
        </div>
      )}
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          latitude: OSLO_CENTER.latitude,
          longitude: OSLO_CENTER.longitude,
          zoom: OSLO_CENTER.zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        cursor={addPinMode ? "crosshair" : undefined}
        onClick={(event) => {
          if (addPinMode) onMapClick(event.lngLat.lat, event.lngLat.lng);
        }}
      >
        <NavigationControl position="top-right" />

        {pins.map((pin) => {
          const isSelected = pin.id === selectedPinId;
          const color = categoryColors[pin.category] ?? categoryColors.ANNET;
          const sun = sunConditions[pin.id];
          const hasSun = sun?.level === "sol";
          const size = isSelected ? 28 : hasSun ? 26 : 22;

          return (
            <Marker
              key={pin.id}
              latitude={pin.latitude}
              longitude={pin.longitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onPinSelect(pin);
              }}
            >
              <div className="relative">
                {hasSun && (
                  <span
                    className="absolute -inset-1 animate-pulse rounded-full bg-amber-300/60"
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  aria-label={`${pin.title}${sun ? `, ${sun.label}` : ""}`}
                  className="relative transition-transform hover:scale-110"
                  style={{
                    width: size,
                    height: size,
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    backgroundColor: hasSun ? "#f59e0b" : color,
                    border: isSelected
                      ? "3px solid white"
                      : hasSun
                        ? "2px solid #fbbf24"
                        : "2px solid white",
                    boxShadow: hasSun
                      ? "0 0 12px rgba(245, 158, 11, 0.6)"
                      : "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                />
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
