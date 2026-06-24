"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { MapPinSummary } from "@/types";
import { PLACE_CATEGORIES, POPULAR_HASHTAGS, TERRACE_FACING } from "@/lib/constants";
import { parseHashtags } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AddressSearch } from "@/components/map/AddressSearch";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type AddPinModalProps = {
  initialLocation: { lat: number; lng: number } | null;
  onClose: () => void;
  onSuccess: (pin: MapPinSummary) => void;
};

export function AddPinModal({ initialLocation, onClose, onSuccess }: AddPinModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [bydel, setBydel] = useState("GRUNERLOKKA");
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

  useEffect(() => {
    if (initialLocation) {
      setLatitude(initialLocation.lat);
      setLongitude(initialLocation.lng);

      fetch(`/api/geocode/reverse?lat=${initialLocation.lat}&lng=${initialLocation.lng}`)
        .then((res) => res.json())
        .then((data: { address?: string }) => {
          if (data.address) setAddress(data.address);
        })
        .catch(() => undefined);
    }
  }, [initialLocation]);

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-pin-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
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
            }}
            placeholder="Gateadresse"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <BydelSelect value={bydel} onChange={(e) => setBydel(e.target.value)} />
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
            label="Tips"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Del lokalhistorie, solforhold eller anbefalinger …"
          />

          <Input
            label="Kallenavn"
            value={authorAlias}
            onChange={(e) => setAuthorAlias(e.target.value)}
            placeholder="Valgfritt kallenavn"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Breddegrad"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              required
            />
            <Input
              label="Lengdegrad"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              required
            />
          </div>

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
      </div>
    </div>
  );
}
