"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import type { PoliticianSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type FeedbackModalProps = {
  politicians: PoliticianSummary[];
  selectedPolitician: PoliticianSummary | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function FeedbackModal({
  politicians,
  selectedPolitician,
  onClose,
  onSuccess,
}: FeedbackModalProps) {
  const [politicianId, setPoliticianId] = useState(selectedPolitician?.id ?? "");
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [bydel, setBydel] = useState("HELE_OSLO");
  const [authorAlias, setAuthorAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (turnstileRequired && !turnstileToken) {
      setError("Bekreft at du ikke er en robot.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          politicianId,
          rating,
          comment,
          bydel,
          authorAlias: authorAlias || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Noe gikk galt.");
        return;
      }

      setSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch {
      setError("Kunne ikke sende tilbakemelding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="feedback-title" className="text-lg font-semibold">
            Gi tilbakemelding
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-oslo-blue-light" aria-label="Lukk">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <p className="rounded-lg bg-oslo-blue-light px-4 py-6 text-center text-sm text-oslo-blue">
            Takk — vi leser tilbakemeldingen.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="feedback-politician" className="text-sm font-medium">
                Politiker
              </label>
              <select
                id="feedback-politician"
                value={politicianId}
                onChange={(e) => setPoliticianId(e.target.value)}
                required
                className="rounded-lg border border-oslo-border px-3 py-2 text-sm"
              >
                <option value="">Velg politiker</option>
                {[...politicians]
                  .sort((a, b) => a.name.localeCompare(b.name, "nb"))
                  .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.party ? `(${p.party})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <BydelSelect
              value={bydel}
              onChange={(e) => setBydel(e.target.value)}
              showHeleOsloOption
              label="Bydel (valgfritt for bypolitikere)"
            />

            <div>
              <label className="text-sm font-medium">Vurdering (1–5)</label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-lg p-2 transition hover:bg-oslo-blue-light"
                    aria-label={`${value} stjerner`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-oslo-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Tilbakemelding"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              placeholder="Hva mener du om vedkommendes arbeid?"
            />

            <Input
              label="Kallenavn (valgfritt)"
              value={authorAlias}
              onChange={(e) => setAuthorAlias(e.target.value)}
            />

            <p className="text-xs text-oslo-muted">
              Respektfull tone kreves. Personangrep og trusler avvises automatisk.
            </p>

            {error && (
              <p className="rounded-lg bg-oslo-red-light px-3 py-2 text-sm text-oslo-red">
                {error}
              </p>
            )}

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Avbryt
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Sender …" : "Send"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
