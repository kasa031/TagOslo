"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { MapboxSetupNotice } from "@/components/map/MapboxSetupNotice";
import { cn } from "@/lib/utils";

export type AddressHit = {
  latitude: number;
  longitude: number;
  address: string;
  placeName: string;
};

type AddressSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (hit: AddressHit) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  minLength?: number;
};

const mapboxConfigured = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

export function AddressSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Søk adresse i Oslo",
  label,
  className,
  inputClassName,
  minLength = 2,
}: AddressSearchProps) {
  const listId = useId();
  const [results, setResults] = useState<AddressHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hint, setHint] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const enterPickRef = useRef(false);

  const pickResult = useCallback(
    (hit: AddressHit) => {
      onChange(hit.address);
      onSelect(hit);
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      setHint(null);
      enterPickRef.current = false;
    },
    [onChange, onSelect],
  );

  const fetchResults = useCallback(
    async (query: string, pickFirstOnComplete = false) => {
      const trimmed = query.trim();
      if (trimmed.length < minLength) {
        setResults([]);
        setHint(null);
        return;
      }

      if (!mapboxConfigured) {
        setResults([]);
        return;
      }

      setLoading(true);
      setHint(null);

      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data = (await response.json()) as AddressHit[] | { error?: string };

        if (!response.ok) {
          setResults([]);
          setHint(
            typeof data === "object" && data && "error" in data && data.error
              ? data.error
              : "Kunne ikke søke adresser akkurat nå.",
          );
          return;
        }

        const hits = Array.isArray(data) ? data : [];
        setResults(hits);
        setOpen(true);
        setActiveIndex(hits.length > 0 ? 0 : -1);

        if (hits.length === 0) {
          setHint(`Ingen treff for «${trimmed}».`);
        } else if (pickFirstOnComplete || enterPickRef.current) {
          pickResult(hits[0]);
        }
      } catch {
        setResults([]);
        setHint("Nettverksfeil ved adressesøk.");
      } finally {
        setLoading(false);
      }
    },
    [minLength, pickResult],
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(value), 250);
    return () => clearTimeout(timer);
  }, [value, fetchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length === 0) return;
      setOpen(true);
      setActiveIndex((prev) => (prev + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) return;
      setOpen(true);
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        pickResult(results[activeIndex]);
      } else if (results.length > 0) {
        pickResult(results[0]);
      } else if (value.trim().length >= minLength) {
        if (loading) {
          enterPickRef.current = true;
        } else {
          void fetchResults(value, true);
        }
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showList = open && (results.length > 0 || loading);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {!mapboxConfigured && (
        <MapboxSetupNotice variant="compact" className="mb-3" />
      )}

      <div className="relative">
        <Input
          label={label}
          value={value}
          disabled={!mapboxConfigured}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pr-9", inputClassName)}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute bottom-2.5 right-3 h-4 w-4 animate-spin text-oslo-muted" />
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border-2 border-oslo-border bg-white shadow-lg"
        >
          {results.map((result, index) => (
            <li key={`${result.placeName}-${index}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition",
                  index === activeIndex
                    ? "bg-summer-sky text-oslo-ink"
                    : "hover:bg-oslo-blue-light",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pickResult(result)}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-oslo-blue" />
                <span>
                  <span className="block font-semibold">{result.address}</span>
                  <span className="block text-xs text-oslo-muted">{result.placeName}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {hint && !loading && (
        <p className="mt-1.5 text-xs text-oslo-muted">{hint}</p>
      )}
    </div>
  );
}
