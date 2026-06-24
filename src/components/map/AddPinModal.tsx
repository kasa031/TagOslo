"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { MapPinSummary } from "@/types";
import { PLACE_CATEGORIES, POPULAR_HASHTAGS, TERRACE_FACING } from "@/lib/constants";
import { parseHashtags } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AddressSearch } from "@/components/map/AddressSearch";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { Modal } from "@/components/ui/Modal";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type AddPinModalProps = {
  initialLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onSuccess: (pin: MapPinSummary) => void;
};

async function fetchBydelForCoordinates(lat: number, lng: number) {
  const response = await fetch(`/api/geocode/bydel?lat=${lat}&lng=${lng}`);
  if (!response.ok) return null;
  return response.json() as Promise<{
    bydelId: string;
    displayName: string;
  } | null>;
}

export function AddPinModal({ initialLocation, onClose, onSuccess }: AddPinModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [bydel, setBydel] = useState("GRUNERLOKKA");
  const [bydelDisplayName, setBydelDisplayName] = useState<string | null>(null);
  const [bydelAuto, setBydelAuto] = useState(true);
  const [category, setCategory] = useState("ANNET");
  const [terraceFacing, setTerraceFacing] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [story, setStory] = useState("");
  const [authorAlias, setAuthorAlias] = useState("");
  const [latitude, setLatitude] = useState(initialLocation?.lat ?? 59.9139);
  const [longitude, setLongitude] = useState(initialLocation?.lng ?? 10.7522);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const syncBydelFromCoordinates = useCallback(async (lat: number, lng: number) => {
    const result = await fetchBydelForCoordinates(lat, lng);
    if (result?.bydelId) {
      setBydel(result.bydelId);
      setBydelDisplayName(result.displayName);
      setBydelAuto(true);
    }
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setLatitude(initialLocation.lat);
      setLongitude(initialLocation.lng);
      void syncBydelFromCoordinates(initialLocation.lat, initialLocation.lng);

      fetch(`/api/geocode/reverse?lat=${initialLocation.lat}&lng=${initialLocation.lng}`)
        .then((res) => res.json())
        .then((data: { address?: string }) => {
          if (data.address) setAddress(data.address);
        })
        .catch(() => undefined);
    }
  }, [initialLocation, syncBydelFromCoordinates]);

  useEffect(() => {
    if (!bydelAuto) return;
    const timer = setTimeout(() => {
      void syncBydelFromCoordinates(latitude, longitude);
    }, 400);
    return () => clearTimeout(timer);
  }, [latitude, longitude, bydelAuto, syncBydelFromCoordinates]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (turnstileRequired && !turnstileToken) {
      setError("Bekreft at du ikke er en robot.");
      setLoading(false);
      return;
    }

    const hashtags = [
      ...parseHashtags(hashtagInput),
      ...parseHashtags(description),
    ];

    try {
      const response = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          address,
          bydel,
          category,
          terraceFacing: terraceFacing || undefined,
          hashtags,
          latitude,
          longitude,
          authorAlias: authorAlias || undefined,
          story: story || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Noe gikk galt.");
        return;
      }

      onSuccess(data.pin as MapPinSummary);
    } catch {
      setError("Kunne ikke lagre stedet. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="add-pin-title">
      <div className="mb-4 flex items-center justify-between">
          <h2 id="add-pin-title" className="text-lg font-semibold">
            Legg til sted
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-oslo-blue-light"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tittel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="F.eks. Solrik terrasse"
          />

          <Textarea
            label="Beskrivelse"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Hva gjør dette stedet spesielt?"
          />

          <AddressSearch
            label="Adresse"
            value={address}
            onChange={setAddress}
            onSelect={(hit) => {
              setAddress(hit.address);
              setLatitude(hit.latitude);
              setLongitude(hit.longitude);
              setBydelAuto(true);
            }}
            placeholder="Gateadresse"
          />

          <p className="rounded-lg bg-oslo-blue-light px-3 py-2 text-xs text-oslo-muted">
            {initialLocation
              ? "Plassering valgt på kartet — juster adresse om nødvendig."
              : "Tips: Bruk «Plasser på kart» for å velge nøyaktig punkt."}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <BydelSelect
                value={bydel}
                onChange={(e) => {
                  setBydel(e.target.value);
                  setBydelAuto(false);
                  setBydelDisplayName(null);
                }}
              />
              {bydelAuto && bydelDisplayName && (
                <p className="mt-1 text-xs text-oslo-muted">
                  Satt automatisk fra kartet
                  {bydelDisplayName === "Sentrum" ? " (Sentrum)" : ""}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pin-category" className="text-sm font-medium">
                Kategori
              </label>
              <select
                id="pin-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-oslo-border px-3 py-2 text-sm"
              >
                {PLACE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(category === "UTESTED" || category === "SPISESTED") && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="terrace-facing" className="text-sm font-medium">
                Terrasseretning
              </label>
              <select
                id="terrace-facing"
                value={terraceFacing}
                onChange={(e) => setTerraceFacing(e.target.value)}
                className="rounded-lg border border-oslo-border px-3 py-2 text-sm"
              >
                {TERRACE_FACING.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-oslo-muted">
                Lagres for fremtidig bruk — påvirker ikke solvisningen ennå.
              </p>
            </div>
          )}

          <Input
            label="Hashtags"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            placeholder="#solservering #lokalhistorie"
          />

          <div className="flex flex-wrap gap-2">
            {POPULAR_HASHTAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full bg-oslo-blue-light px-2 py-0.5 text-xs text-oslo-blue"
                onClick={() =>
                  setHashtagInput((prev) =>
                    prev.includes(tag) ? prev : `${prev} ${tag}`.trim(),
                  )
                }
              >
                {tag}
              </button>
            ))}
          </div>

          <Textarea
            label="Tips / lokalhistorie (valgfritt)"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Del lokalhistorie, solforhold eller anbefalinger …"
          />
          <p className="-mt-2 text-xs text-oslo-muted">
            Stedet vises på kartet med en gang. Godkjent tekst publiseres automatisk.
            Grovt språk og kontaktinfo stoppes.
          </p>

          <Input
            label="Kallenavn"
            value={authorAlias}
            onChange={(e) => setAuthorAlias(e.target.value)}
            placeholder="Valgfritt kallenavn"
          />

          <details className="rounded-lg border border-oslo-border px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-oslo-ink">
              Avansert (koordinater)
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Input
                label="Breddegrad"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => {
                  setLatitude(parseFloat(e.target.value));
                  setBydelAuto(true);
                }}
                required
              />
              <Input
                label="Lengdegrad"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => {
                  setLongitude(parseFloat(e.target.value));
                  setBydelAuto(true);
                }}
                required
              />
            </div>
          </details>

          {error && (
            <p className="rounded-lg bg-oslo-red-light px-3 py-2 text-sm text-oslo-red">
              {error}
            </p>
          )}

          <p className="text-xs text-oslo-muted">Innhold kan bli fjernet ved brudd på vilkårene.</p>

          <TurnstileWidget
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Lagrer …" : "Publiser"}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
