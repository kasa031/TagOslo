"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const MAX_IMAGES = 5;

type AddContentModalProps = {
  pinId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddContentModal({ pinId, onClose, onSuccess }: AddContentModalProps) {
  const [mode, setMode] = useState<"TEXT" | "IMAGE" | "VIDEO" | "AUDIO">("TEXT");
  const [textContent, setTextContent] = useState("");
  const [authorAlias, setAuthorAlias] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (turnstileRequired && !turnstileToken) {
      setError("Bekreft at du er et menneske.");
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
        if (files.length === 0) {
          setError("Velg minst én fil.");
          setLoading(false);
          return;
        }

        const form = new FormData();
        form.append("type", mode);
        for (const file of files) {
          form.append("file", file);
        }
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
      setTimeout(onSuccess, 1500);
    } catch {
      setError("Kunne ikke lagre innhold.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="add-content-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="add-content-title" className="text-lg font-bold text-oslo-ink">
          Legg til innhold
        </h2>
        <button type="button" onClick={onClose} className="rounded-xl p-1 hover:bg-oslo-blue-light" aria-label="Lukk">
          <X className="h-5 w-5" />
        </button>
      </div>

      {successMessage ? (
        <div className="space-y-3">
          <p className="rounded-xl bg-oslo-blue-light px-4 py-3 text-sm font-medium text-oslo-blue">
            {successMessage}
          </p>
          {successMessage.includes("godkjent") && (
            <p className="text-xs text-oslo-muted">
              Du får beskjed når innholdet er synlig. Tekst godkjennes automatisk hvis den følger
              retningslinjene.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["TEXT", "IMAGE", "VIDEO", "AUDIO"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setMode(t);
                  setFiles([]);
                }}
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
            <>
              <Textarea
                label="Historie eller tips"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                required
                placeholder="Del lokalhistorie, solforhold eller tips …"
              />
              <p className="text-xs text-oslo-muted">
                Ren tekst publiseres med en gang hvis den passer retningslinjene. Grovt språk og
                personangrep stoppes automatisk.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="media-file" className="text-sm font-medium">
                  {mode === "IMAGE"
                    ? `Bilder (maks ${MAX_IMAGES})`
                    : mode === "VIDEO"
                      ? "Kort video"
                      : "Lydfil"}
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
                  multiple={mode === "IMAGE"}
                  onChange={(e) => {
                    const selected = Array.from(e.target.files ?? []);
                    setFiles(mode === "IMAGE" ? selected.slice(0, MAX_IMAGES) : selected.slice(0, 1));
                  }}
                  required
                  className="text-sm"
                />
                {files.length > 0 && (
                  <ul className="text-xs text-oslo-muted">
                    {files.map((file) => (
                      <li key={`${file.name}-${file.size}`}>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-oslo-muted">
                  Maks {mode === "IMAGE" ? "5 MB per bilde" : mode === "VIDEO" ? "20 MB" : "10 MB"}.
                  {mode === "IMAGE"
                    ? " Bilder sjekkes manuelt før de vises (gratis bilde-AI finnes ikke ennå)."
                    : " Media sjekkes manuelt før publisering."}
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
              {loading ? "Lagrer …" : mode === "IMAGE" && files.length > 1 ? "Send bilder" : "Send"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
