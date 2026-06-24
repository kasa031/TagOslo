"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type AddContentModalProps = {
  pinId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddContentModal({ pinId, onClose, onSuccess }: AddContentModalProps) {
  const [mode, setMode] = useState<"TEXT" | "IMAGE" | "VIDEO" | "AUDIO">("TEXT");
  const [textContent, setTextContent] = useState("");
  const [authorAlias, setAuthorAlias] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (turnstileRequired && !turnstileToken) {
      setError("Bekreft at du ikke er en robot.");
      return;
    }

    setLoading(true);

    try {
      let response: Response;

      if (mode === "TEXT") {
        response = await fetch(`/api/pins/${pinId}/contents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "TEXT",
            textContent,
            authorAlias: authorAlias || undefined,
            turnstileToken: turnstileToken || undefined,
          }),
        });
      } else {
        if (!file) {
          setError("Velg en fil.");
          setLoading(false);
          return;
        }
        const form = new FormData();
        form.append("type", mode);
        form.append("file", file);
        if (textContent) form.append("textContent", textContent);
        if (authorAlias) form.append("authorAlias", authorAlias);
        if (turnstileToken) form.append("turnstileToken", turnstileToken);

        response = await fetch(`/api/pins/${pinId}/contents`, {
          method: "POST",
          body: form,
        });
      }

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Noe gikk galt.");
        return;
      }

      setSuccessMessage(data.message ?? "Lagret!");
      setTimeout(onSuccess, 1200);
    } catch {
      setError("Kunne ikke lagre innhold.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-content-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="add-content-title" className="text-lg font-bold text-oslo-ink">
            Legg til innhold
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl p-1 hover:bg-oslo-blue-light" aria-label="Lukk">
            <X className="h-5 w-5" />
          </button>
        </div>

        {successMessage ? (
          <p className="rounded-xl bg-oslo-blue-light px-4 py-3 text-sm font-medium text-oslo-blue">
            {successMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["TEXT", "IMAGE", "VIDEO", "AUDIO"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMode(t)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    mode === t
                      ? "bg-oslo-blue text-white"
                      : "bg-oslo-blue-light text-oslo-blue hover:bg-oslo-blue/10"
                  }`}
                >
                  {t === "TEXT" ? "Tekst" : t === "IMAGE" ? "Bilde" : t === "VIDEO" ? "Video" : "Lyd"}
                </button>
              ))}
            </div>

            {mode === "TEXT" ? (
              <Textarea
                label="Historie eller tips"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required
                placeholder="Del lokalhistorie, solforhold eller tips …"
              />
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="media-file" className="text-sm font-medium">
                    {mode === "IMAGE" ? "Bilde" : mode === "VIDEO" ? "Kort video" : "Lydfil"}
                  </label>
                  <input
                    id="media-file"
                    type="file"
                    accept={
                      mode === "IMAGE"
                        ? "image/*"
                        : mode === "VIDEO"
                          ? "video/*"
                          : "audio/*"
                    }
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    required
                    className="text-sm"
                  />
                  <p className="text-xs text-oslo-muted">
                    Maks {mode === "IMAGE" ? "5" : mode === "VIDEO" ? "20" : "10"} MB. Media
                    sjekkes manuelt før publisering.
                  </p>
                </div>
                <Textarea
                  label="Bildetekst (valgfritt)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </>
            )}

            <Input
              label="Kallenavn (valgfritt)"
              value={authorAlias}
              onChange={(e) => setAuthorAlias(e.target.value)}
            />

            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />

            {error && (
              <p className="rounded-xl bg-oslo-red-light px-3 py-2 text-sm text-oslo-red">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Avbryt
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Lagrer …" : "Publiser"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
