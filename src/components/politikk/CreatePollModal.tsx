"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { PollSummary, PoliticianSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type CreatePollModalProps = {
  politicians: PoliticianSummary[];
  onClose: () => void;
  onSuccess: (poll: PollSummary) => void;
};

export function CreatePollModal({
  politicians,
  onClose,
  onSuccess,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [bydel, setBydel] = useState("HELE_OSLO");
  const [options, setOptions] = useState(["Ja", "Nei"]);
  const [selectedPoliticians, setSelectedPoliticians] = useState<string[]>([]);
  const [tagPoliticians, setTagPoliticians] = useState(false);
  const [authorAlias, setAuthorAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          description: description || undefined,
          bydel,
          options: options.filter((o) => o.trim()),
          politicianIds: tagPoliticians ? selectedPoliticians : [],
          authorAlias: authorAlias || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Noe gikk galt.");
        return;
      }

      onSuccess(data.poll as PollSummary);
    } catch {
      setError("Kunne ikke opprette avstemning.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="create-poll-title">
      <div className="mb-4 flex items-center justify-between">
          <h2 id="create-poll-title" className="text-lg font-semibold">
            Opprett avstemning
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-oslo-blue-light" aria-label="Lukk">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Spørsmål"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="Hva lurer du på?"
          />

          <Textarea
            label="Beskrivelse (valgfritt)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <BydelSelect
            value={bydel}
            onChange={(e) => setBydel(e.target.value)}
            showHeleOsloOption
            heleOsloOptionLabel="Hele Oslo"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Svaralternativer</label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const next = [...options];
                    next[index] = e.target.value;
                    setOptions(next);
                  }}
                  placeholder={`Alternativ ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    className="rounded-lg p-2 text-oslo-muted hover:bg-oslo-red-light hover:text-oslo-red"
                    aria-label="Fjern alternativ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOptions([...options, ""])}
              >
                <Plus className="h-4 w-4" />
                Legg til alternativ
              </Button>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-oslo-border px-3 py-3">
            <input
              type="checkbox"
              checked={tagPoliticians}
              onChange={(e) => {
                setTagPoliticians(e.target.checked);
                if (!e.target.checked) setSelectedPoliticians([]);
              }}
              className="mt-0.5 rounded border-oslo-border"
            />
            <span className="text-sm">
              <span className="font-medium text-oslo-ink">
                Retter spørsmålet seg mot en politiker?
              </span>
              <span className="mt-0.5 block text-oslo-muted">
                Bruk dette når du vil stille et politikkspørsmål til vedkommende — ikke
                for generelle Oslo-spørsmål som solservering eller steder.
              </span>
            </span>
          </label>

          {tagPoliticians && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Velg politiker(e)</span>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-oslo-border p-2">
                {politicians.map((p, i) => {
                  const selected = selectedPoliticians.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-oslo-blue-light"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          setSelectedPoliticians((prev) =>
                            selected ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                          );
                        }}
                        className="rounded border-oslo-border"
                      />
                      <span className="text-sm text-oslo-ink">{p.name}</span>
                      {p.party && (
                        <Badge variant="summer" colorIndex={i} className="text-[10px]">
                          {p.party}
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <Input
            label="Kallenavn (valgfritt)"
            value={authorAlias}
            onChange={(e) => setAuthorAlias(e.target.value)}
          />

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
              {loading ? "Oppretter …" : "Publiser avstemning"}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
