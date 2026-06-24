"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Plus, Filter, MapPinned, X } from "lucide-react";
import type { MapPinSummary } from "@/types";
import type { SunCondition } from "@/types/sol";
import { BYDELER, POPULAR_HASHTAGS, PLACE_CATEGORIES } from "@/lib/constants";
import { formatPinBydelLabel } from "@/lib/oslo-bydeler";
import { formatBydelLabel, normalizeHashtag, toLocalDatetimeInput } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AddPinModal } from "@/components/map/AddPinModal";
import { PinDetailPanel } from "@/components/map/PinDetailPanel";
import { SolPanel } from "@/components/map/SolPanel";
import { SunConditionBadge } from "@/components/map/SunConditionBadge";
import { AddressSearch, type AddressHit } from "@/components/map/AddressSearch";

type GeocodeHit = AddressHit;

const OsloMap = dynamic(() => import("@/components/map/OsloMap").then((m) => m.OsloMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] min-h-[400px] items-center justify-center rounded-2xl bg-oslo-blue-light">
      <p className="text-sm text-oslo-muted">Laster kart …</p>
    </div>
  ),
});

function PinList({
  pins,
  sunConditions,
  onSelect,
  emptyMessage,
  emptyAction,
}: {
  pins: MapPinSummary[];
  sunConditions: Record<string, SunCondition>;
  onSelect: (pin: MapPinSummary) => void;
  emptyMessage: string;
  emptyAction?: { label: string; onClick: () => void };
}) {
  return (
    <Card title="Steder i utvalget">
      <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
        {pins.map((pin) => {
          const sun = sunConditions[pin.id];
          return (
            <li key={pin.id}>
              <button
                type="button"
                className="w-full rounded-xl border-2 border-oslo-border p-3 text-left transition hover:border-oslo-blue hover:bg-oslo-blue-light"
                onClick={() => onSelect(pin)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-oslo-ink">{pin.title}</p>
                  {sun && (
                    <SunConditionBadge level={sun.level} label={sun.label} compact />
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
        {pins.length === 0 && (
          <li className="space-y-3 py-2">
            <p className="text-sm text-oslo-muted">{emptyMessage}</p>
            {emptyAction && (
              <Button type="button" variant="secondary" size="sm" onClick={emptyAction.onClick}>
                {emptyAction.label}
              </Button>
            )}
          </li>
        )}
      </ul>
    </Card>
  );
}

export function KartPageClient({ initialPins }: { initialPins: MapPinSummary[] }) {
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);

  const [pins, setPins] = useState(initialPins);
  const [selectedPin, setSelectedPin] = useState<MapPinSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedAddress, setSearchedAddress] = useState<GeocodeHit | null>(null);
  const [searchedSun, setSearchedSun] = useState<SunCondition | null>(null);
  const [searchedSunError, setSearchedSunError] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [bydelFilter, setBydelFilter] = useState("");
  const [hashtagFilter, setHashtagFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLocation, setAddLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addPinMode, setAddPinMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [solNowOnly, setSolNowOnly] = useState(false);
  const [checkTime, setCheckTime] = useState(() => toLocalDatetimeInput(new Date()));
  const [sunConditions, setSunConditions] = useState<Record<string, SunCondition>>({});
  const [osloSun, setOsloSun] = useState<SunCondition | null>(null);
  const [solCheckedAt, setSolCheckedAt] = useState<string | null>(null);
  const [solLoading, setSolLoading] = useState(false);
  const [solError, setSolError] = useState<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get("hashtag");
    if (!raw) return;
    const tag = normalizeHashtag(raw);
    if (!tag) return;
    setHashtagFilter(tag);
    setShowFilters(true);
  }, [searchParams]);

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

  const hasActiveFilters = Boolean(bydelFilter || hashtagFilter || categoryFilter);

  const selectPin = useCallback((pin: MapPinSummary) => {
    setSelectedPin(pin);
    setFlyTo({ lat: pin.latitude, lng: pin.longitude });
  }, []);

  const fetchSunForAddress = useCallback(
    async (hit: GeocodeHit) => {
      setSearchedSunError(false);
      try {
        const at = new Date(checkTime);
        const response = await fetch("/api/sol", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            at: at.toISOString(),
            locations: [{ id: "search", latitude: hit.latitude, longitude: hit.longitude }],
          }),
        });

        if (!response.ok) {
          setSearchedSun(null);
          setSearchedSunError(true);
          return;
        }

        const data = (await response.json()) as { conditions: SunCondition[] };
        setSearchedSun(data.conditions[0] ?? null);
      } catch {
        setSearchedSun(null);
        setSearchedSunError(true);
      }
    },
    [checkTime],
  );

  useEffect(() => {
    if (searchedAddress) void fetchSunForAddress(searchedAddress);
  }, [searchedAddress, fetchSunForAddress]);

  const handleAddressSelect = (hit: GeocodeHit) => {
    setSearchedAddress(hit);
    setFlyTo({ lat: hit.latitude, lng: hit.longitude });
  };

  const fetchSunConditions = useCallback(async () => {
    if (baseFilteredPins.length === 0) {
      setSunConditions({});
      setOsloSun(null);
      setSolCheckedAt(null);
      return;
    }

    setSolLoading(true);
    setSolError(null);

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

      if (!response.ok) {
        setSolError("Kunne ikke hente solforhold. Sjekk nettet og prøv igjen.");
        return;
      }

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
    } catch {
      setSolError("Kunne ikke hente solforhold.");
    } finally {
      setSolLoading(false);
    }
  }, [baseFilteredPins, checkTime]);

  useEffect(() => {
    void fetchSunConditions();
  }, [fetchSunConditions]);

  useEffect(() => {
    const interval = setInterval(fetchSunConditions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSunConditions]);

  const handlePinAdded = (pin: MapPinSummary) => {
    setPins((prev) => [pin, ...prev]);
    setShowAddModal(false);
    setAddLocation(null);
    setAddPinMode(false);
    selectPin(pin);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!addPinMode) return;
    setAddLocation({ lat, lng });
    setShowAddModal(true);
    setAddPinMode(false);
  };

  const clearFilters = () => {
    setBydelFilter("");
    setHashtagFilter("");
    setCategoryFilter("");
  };

  const emptyListMessage = solNowOnly
    ? "Ingen steder med sol akkurat nå for dette tidspunktet."
    : hasActiveFilters
      ? "Ingen steder matcher filtrene."
      : "Ingen steder ennå. Legg til det første!";

  const emptyListAction = solNowOnly
    ? { label: "Vis alle steder", onClick: () => setSolNowOnly(false) }
    : hasActiveFilters
      ? { label: "Nullstill filtre", onClick: clearFilters }
      : undefined;

  const selectedSun = selectedPin ? sunConditions[selectedPin.id] : undefined;

  const pinList = (
    <PinList
      pins={filteredPins}
      sunConditions={sunConditions}
      onSelect={selectPin}
      emptyMessage={emptyListMessage}
      emptyAction={emptyListAction}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-oslo-ink sm:text-3xl">Kart</h1>
        <p className="mt-1 text-sm text-oslo-muted">
          Finn steder, sjekk sol og del lokalhistorie.
        </p>
      </div>

      <div className="mb-4">
        <SolPanel
          oslo={osloSun}
          sunnyCount={sunnyCount}
          totalChecked={baseFilteredPins.length}
          checkedAt={solCheckedAt}
          loading={solLoading}
          error={solError}
          solNowOnly={solNowOnly}
          checkTime={checkTime}
          onToggleSolNow={() => setSolNowOnly((value) => !value)}
          onRefresh={fetchSunConditions}
          onCheckTimeChange={setCheckTime}
          onClearError={() => setSolError(null)}
        />
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border-2 border-oslo-blue/30 bg-oslo-blue-light px-3 py-2">
          <span className="text-xs font-medium text-oslo-ink">Aktive filtre:</span>
          {bydelFilter && (
            <Badge variant="summer" colorIndex={0}>
              {formatBydelLabel(bydelFilter)}
            </Badge>
          )}
          {hashtagFilter && (
            <Badge variant="summer" colorIndex={1}>
              {hashtagFilter}
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant="summer" colorIndex={2}>
              {PLACE_CATEGORIES.find((c) => c.id === categoryFilter)?.label ?? categoryFilter}
            </Badge>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-oslo-blue hover:underline"
          >
            <X className="h-3 w-3" aria-hidden />
            Fjern alle
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <AddressSearch
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (searchedAddress && value !== searchedAddress.address) {
                setSearchedAddress(null);
                setSearchedSun(null);
                setSearchedSunError(false);
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
          {searchedAddress && searchedSunError && (
            <p className="mt-2 text-xs text-oslo-red">Kunne ikke hente sol for denne adressen.</p>
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
        <Button
          variant={addPinMode ? "primary" : "secondary"}
          onClick={() => {
            setAddPinMode((v) => !v);
            if (addPinMode) setAddLocation(null);
          }}
          aria-pressed={addPinMode}
        >
          <MapPinned className="h-4 w-4" />
          {addPinMode ? "Velg på kart …" : "Plasser på kart"}
        </Button>
        <Button
          onClick={() => {
            setAddLocation(null);
            setShowAddModal(true);
          }}
        >
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
                  className={hashtagFilter === tag ? "ring-2 ring-oslo-ink ring-offset-1" : ""}
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
            onPinSelect={selectPin}
            onMapClick={handleMapClick}
            addPinMode={addPinMode}
          />
          <p className="mt-2 text-xs text-oslo-muted">
            {filteredPins.length} steder
            {solNowOnly ? " med sol nå" : ""}
            {addPinMode
              ? " · Trykk på kartet der du vil legge til et sted"
              : " · Trykk «Plasser på kart» for å velge punkt"}
          </p>
        </div>

        <div ref={listRef} className="hidden space-y-4 lg:block">
          {selectedPin ? (
            <PinDetailPanel
              pin={selectedPin}
              sunCondition={selectedSun}
              onClose={() => setSelectedPin(null)}
            />
          ) : (
            pinList
          )}

          <Card title="Bydeler">
            <div className="flex flex-wrap gap-2">
              {BYDELER.map((bydel, i) => (
                <button
                  key={bydel.id}
                  type="button"
                  onClick={() => setBydelFilter(bydelFilter === bydel.id ? "" : bydel.id)}
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

      <div className="mt-4 space-y-4 lg:hidden">
        {selectedPin ? null : pinList}
      </div>

      {selectedPin && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden">
          <button
            type="button"
            className="min-h-0 flex-1 bg-black/40"
            aria-label="Lukk stedsdetaljer"
            onClick={() => setSelectedPin(null)}
          />
          <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
            <PinDetailPanel
              pin={selectedPin}
              sunCondition={selectedSun}
              onClose={() => setSelectedPin(null)}
            />
          </div>
        </div>
      )}

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
