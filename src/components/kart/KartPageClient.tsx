"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Plus, Filter } from "lucide-react";
import type { MapPinSummary } from "@/types";
import type { SunCondition } from "@/types/sol";
import { BYDELER, POPULAR_HASHTAGS, PLACE_CATEGORIES } from "@/lib/constants";
import { formatPinBydelLabel } from "@/lib/oslo-bydeler";
import { Button } from "@/components/ui/Button";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AddPinModal } from "@/components/map/AddPinModal";
import { PinDetailPanel } from "@/components/map/PinDetailPanel";
import { SolPanel } from "@/components/map/SolPanel";
import { SunConditionBadge } from "@/components/map/SunConditionBadge";
import { AddressSearch, type AddressHit } from "@/components/map/AddressSearch";

const OsloMap = dynamic(() => import("@/components/map/OsloMap").then((m) => m.OsloMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] min-h-[400px] items-center justify-center rounded-2xl bg-oslo-blue-light">
      <p className="text-sm text-oslo-muted">Laster kart …</p>
    </div>
  ),
});

type GeocodeHit = AddressHit;

function toLocalDatetimeInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function KartPageClient({ initialPins }: { initialPins: MapPinSummary[] }) {
  const [pins, setPins] = useState(initialPins);
  const [selectedPin, setSelectedPin] = useState<MapPinSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedAddress, setSearchedAddress] = useState<GeocodeHit | null>(null);
  const [searchedSun, setSearchedSun] = useState<SunCondition | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [bydelFilter, setBydelFilter] = useState("");
  const [hashtagFilter, setHashtagFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLocation, setAddLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [solNowOnly, setSolNowOnly] = useState(false);
  const [checkTime, setCheckTime] = useState(() => toLocalDatetimeInput(new Date()));
  const [sunConditions, setSunConditions] = useState<Record<string, SunCondition>>({});
  const [osloSun, setOsloSun] = useState<SunCondition | null>(null);
  const [solCheckedAt, setSolCheckedAt] = useState<string | null>(null);
  const [solLoading, setSolLoading] = useState(false);

  const baseFilteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (bydelFilter && pin.bydel !== bydelFilter) return false;
      if (hashtagFilter && !pin.hashtags.includes(hashtagFilter)) return false;
      if (categoryFilter && pin.category !== categoryFilter) return false;
      return true;
    });
  }, [pins, bydelFilter, hashtagFilter, categoryFilter]);

  const filteredPins = useMemo(() => {
    if (!solNowOnly) return baseFilteredPins;
    return baseFilteredPins.filter((pin) => sunConditions[pin.id]?.isSunnyNow);
  }, [baseFilteredPins, solNowOnly, sunConditions]);

  const sunnyCount = useMemo(
    () => baseFilteredPins.filter((pin) => sunConditions[pin.id]?.isSunnyNow).length,
    [baseFilteredPins, sunConditions],
  );

  const fetchSunForAddress = useCallback(
    async (hit: GeocodeHit) => {
      try {
        const at = new Date(checkTime);
        const response = await fetch("/api/sol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            at: at.toISOString(),
            locations: [
              {
                id: "search",
                latitude: hit.latitude,
                longitude: hit.longitude,
              },
            ],
          }),
        });

        if (!response.ok) return;

        const data = (await response.json()) as { conditions: SunCondition[] };
        setSearchedSun(data.conditions[0] ?? null);
      } catch {
        setSearchedSun(null);
      }
    },
    [checkTime],
  );

  useEffect(() => {
    if (searchedAddress) {
      void fetchSunForAddress(searchedAddress);
    }
  }, [searchedAddress, fetchSunForAddress]);

  const handleAddressSelect = (hit: GeocodeHit) => {
    setSearchedAddress(hit);
    setFlyTo({ lat: hit.latitude, lng: hit.longitude });
  };

  const fetchSunConditions = useCallback(async () => {
    if (baseFilteredPins.length === 0) {
      setSunConditions({});
      return;
    }

    setSolLoading(true);

    try {
      const at = new Date(checkTime);
      const response = await fetch("/api/sol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          at: at.toISOString(),
          locations: baseFilteredPins.map((pin) => ({
            id: pin.id,
            latitude: pin.latitude,
            longitude: pin.longitude,
          })),
        }),
      });

      if (!response.ok) return;

      const data = (await response.json()) as {
        checkedAt: string;
        oslo: SunCondition;
        conditions: SunCondition[];
      };

      const map: Record<string, SunCondition> = {};
      for (const condition of data.conditions) {
        map[condition.pinId] = condition;
      }

      setSunConditions(map);
      setOsloSun(data.oslo);
      setSolCheckedAt(data.checkedAt);
    } finally {
      setSolLoading(false);
    }
  }, [baseFilteredPins, checkTime]);

  useEffect(() => {
    fetchSunConditions();
  }, [fetchSunConditions]);

  useEffect(() => {
    const interval = setInterval(fetchSunConditions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSunConditions]);

  const handlePinAdded = (pin: MapPinSummary) => {
    setPins((prev) => [pin, ...prev]);
    setShowAddModal(false);
    setAddLocation(null);
    setSelectedPin(pin);
    setFlyTo({ lat: pin.latitude, lng: pin.longitude });
  };

  const selectedSun = selectedPin ? sunConditions[selectedPin.id] : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-oslo-ink sm:text-3xl">Kart</h1>
      </div>

      <div className="mb-4">
        <SolPanel
          oslo={osloSun}
          sunnyCount={sunnyCount}
          totalChecked={baseFilteredPins.length}
          checkedAt={solCheckedAt}
          loading={solLoading}
          solNowOnly={solNowOnly}
          checkTime={checkTime}
          onToggleSolNow={() => setSolNowOnly((value) => !value)}
          onRefresh={fetchSunConditions}
          onCheckTimeChange={setCheckTime}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <AddressSearch
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (searchedAddress && value !== searchedAddress.address) {
                setSearchedAddress(null);
                setSearchedSun(null);
              }
            }}
            onSelect={handleAddressSelect}
            placeholder="Søk adresse"
            inputClassName="pl-3"
          />
          {searchedAddress && searchedSun && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border-2 border-oslo-blue bg-oslo-blue-light px-3 py-2 text-sm">
              <MapPin className="h-4 w-4 text-oslo-blue" />
              <span className="font-semibold text-oslo-ink">{searchedAddress.address}</span>
              <SunConditionBadge level={searchedSun.level} label={searchedSun.label} />
              <span className="text-xs text-oslo-muted">
                Skydekke {searchedSun.cloudPercent}% · Solhøyde {searchedSun.sunElevation}°
              </span>
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Legg til sted
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <BydelSelect
              label="Bydel"
              showAllOption
              value={bydelFilter}
              onChange={(e) => setBydelFilter(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-filter" className="text-sm font-medium">
                Kategori
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-oslo-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Alle kategorier</option>
                {PLACE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="hashtag-filter" className="text-sm font-medium">
                Hashtag
              </label>
              <select
                id="hashtag-filter"
                value={hashtagFilter}
                onChange={(e) => setHashtagFilter(e.target.value)}
                className="rounded-lg border border-oslo-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Alle hashtags</option>
                {POPULAR_HASHTAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {POPULAR_HASHTAGS.map((tag, i) => (
              <button
                key={tag}
                type="button"
                onClick={() => setHashtagFilter(hashtagFilter === tag ? "" : tag)}
              >
                <Badge
                  variant="summer"
                  colorIndex={i}
                  className={
                    hashtagFilter === tag ? "ring-2 ring-oslo-ink ring-offset-1" : ""
                  }
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OsloMap
            pins={filteredPins}
            sunConditions={sunConditions}
            selectedPinId={selectedPin?.id ?? null}
            flyTo={flyTo}
            onPinSelect={setSelectedPin}
            onMapClick={(lat, lng) => {
              setAddLocation({ lat, lng });
              setShowAddModal(true);
            }}
          />
          <p className="mt-2 text-xs text-oslo-muted">
            {filteredPins.length} steder
            {solNowOnly ? " med sol nå" : ""} · Klikk på kartet for å legge til et nytt sted
          </p>
        </div>

        <div className="space-y-4">
          {selectedPin ? (
            <PinDetailPanel
              pin={selectedPin}
              sunCondition={selectedSun}
              onClose={() => setSelectedPin(null)}
            />
          ) : (
            <Card title="Steder i utvalget">
              <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
                {filteredPins.map((pin) => {
                  const sun = sunConditions[pin.id];
                  return (
                    <li key={pin.id}>
                      <button
                        type="button"
                        className="w-full rounded-xl border-2 border-oslo-border p-3 text-left transition hover:border-oslo-blue hover:bg-oslo-blue-light"
                        onClick={() => {
                          setSelectedPin(pin);
                          setFlyTo({ lat: pin.latitude, lng: pin.longitude });
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-oslo-ink">{pin.title}</p>
                          {sun && (
                            <SunConditionBadge
                              level={sun.level}
                              label={sun.label}
                              compact
                            />
                          )}
                        </div>
                        <p className="text-xs text-oslo-muted">
                          {formatPinBydelLabel(pin.bydel, pin.id)}
                          {pin.address ? ` · ${pin.address}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {pin.hashtags.map((tag, ti) => (
                            <Badge key={tag} variant="summer" colorIndex={ti}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    </li>
                  );
                })}
                {filteredPins.length === 0 && (
                  <p className="text-sm text-oslo-muted">
                    {solNowOnly
                      ? "Ingen steder med sol."
                      : "Ingen treff."}
                  </p>
                )}
              </ul>
            </Card>
          )}

          <Card title="Bydeler">
            <div className="flex flex-wrap gap-2">
              {BYDELER.map((bydel, i) => (
                <button
                  key={bydel.id}
                  type="button"
                  onClick={() =>
                    setBydelFilter(bydelFilter === bydel.id ? "" : bydel.id)
                  }
                >
                  <Badge
                    variant="summer"
                    colorIndex={i}
                    className={
                      bydelFilter === bydel.id ? "ring-2 ring-oslo-ink ring-offset-1" : ""
                    }
                  >
                    {bydel.label}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showAddModal && (
        <AddPinModal
          initialLocation={addLocation}
          onClose={() => {
            setShowAddModal(false);
            setAddLocation(null);
          }}
          onSuccess={handlePinAdded}
        />
      )}
    </div>
  );
}
