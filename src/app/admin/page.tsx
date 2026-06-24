"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

type PendingContent = {
  id: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
  textContent: string | null;
  mediaUrl: string | null;
  authorAlias: string | null;
  createdAt: string;
  pin: { title: string };
};

type PendingReview = {
  id: string;
  rating: number;
  comment: string | null;
  authorAlias: string | null;
  createdAt: string;
  pin: { title: string };
};

type PendingFeedback = {
  id: string;
  rating: number;
  comment: string;
  authorAlias: string | null;
  createdAt: string;
  politician: { name: string };
};

type ModerationData = {
  contents: PendingContent[];
  reviews: PendingReview[];
  feedback: PendingFeedback[];
};

const CONTENT_TYPE_LABEL: Record<PendingContent["type"], string> = {
  TEXT: "Tekst",
  IMAGE: "Bilde",
  VIDEO: "Video",
  AUDIO: "Lyd",
};

export default function AdminModerationPage() {
  const [key, setKey] = useState("");
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [data, setData] = useState<ModerationData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("tagoslo-admin-key");
    if (saved) setStoredKey(saved);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("tagoslo-admin-key");
    sessionStorage.removeItem("osloliv-admin-key");
    setStoredKey(null);
    setData(null);
    setKey("");
  };

  const load = useCallback(async (adminKey: string) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/moderation", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });

      if (!response.ok) {
        setError("Ugyldig nøkkel eller ingen tilgang.");
        return;
      }

      const items = (await response.json()) as ModerationData;
      setData(items);
      setStoredKey(adminKey);
      sessionStorage.setItem("tagoslo-admin-key", adminKey);
    } catch {
      setError("Kunne ikke hente køen. Sjekk nettet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (storedKey) void load(storedKey);
  }, [storedKey, load]);

  const moderate = async (
    type: "content" | "review" | "feedback",
    id: string,
    action: "APPROVED" | "REJECTED",
  ) => {
    if (!storedKey) return;

    setActingOn(`${type}-${id}`);
    setError("");

    try {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, id, action }),
      });

      if (!response.ok) {
        setError("Handlingen feilet. Prøv igjen.");
        return;
      }

      await load(storedKey);
    } catch {
      setError("Kunne ikke oppdatere. Sjekk nettet.");
    } finally {
      setActingOn(null);
    }
  };

  if (!storedKey) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-md px-4 py-10">
        <Card title="Moderering">
          <p className="mb-4 text-sm text-oslo-muted">
            Logg inn med admin-nøkkelen fra Netlify (<code className="text-xs">MODERATION_ADMIN_KEY</code>).
            Fungerer på mobil — lagre siden som snarvei i hjemskjermen.
          </p>
          <Input
            label="Admin-nøkkel"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="mt-2 text-sm text-oslo-red">{error}</p>}
          <Button className="mt-4 w-full py-3 text-base" onClick={() => load(key)} disabled={!key.trim()}>
            Logg inn
          </Button>
        </Card>
      </div>
    );
  }

  const total =
    (data?.contents.length ?? 0) +
    (data?.reviews.length ?? 0) +
    (data?.feedback.length ?? 0);

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-oslo-ink sm:text-2xl">Moderering</h1>
          <p className="mt-1 text-sm text-oslo-muted">
            {loading ? "Henter …" : `${total} venter på svar`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => storedKey && load(storedKey)}
            disabled={loading}
            className="rounded-xl border-2 border-oslo-border p-2.5 text-oslo-ink hover:bg-oslo-blue-light disabled:opacity-50"
            aria-label="Oppdater kø"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button variant="secondary" size="sm" onClick={logout}>
            Logg ut
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-oslo-red-light px-3 py-2 text-sm text-oslo-red">{error}</p>
      )}

      <div className="mt-5 space-y-4">
        {data?.contents.map((item) => {
          const busy = actingOn === `content-${item.id}`;
          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-oslo-muted">
                  {CONTENT_TYPE_LABEL[item.type]} · {item.pin.title}
                </p>
                <span className="text-xs text-oslo-muted">{formatDate(item.createdAt)}</span>
              </div>

              {item.type === "IMAGE" && item.mediaUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.mediaUrl}
                  alt={item.textContent ?? "Bilde til godkjenning"}
                  className="mt-3 max-h-64 w-full rounded-xl object-contain bg-oslo-blue-light"
                />
              )}
              {item.type === "VIDEO" && item.mediaUrl && (
                <video src={item.mediaUrl} controls className="mt-3 max-h-64 w-full rounded-xl" />
              )}
              {item.type === "AUDIO" && item.mediaUrl && (
                <audio src={item.mediaUrl} controls className="mt-3 w-full" />
              )}

              {item.textContent && (
                <p className="mt-3 text-sm leading-relaxed text-oslo-ink">{item.textContent}</p>
              )}
              {!item.textContent && item.type !== "TEXT" && (
                <p className="mt-3 text-sm italic text-oslo-muted">(ingen bildetekst)</p>
              )}

              {item.authorAlias && (
                <p className="mt-2 text-xs text-oslo-muted">Fra: {item.authorAlias}</p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => moderate("content", item.id, "APPROVED")}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-oslo-blue px-4 py-3 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                  Godkjenn
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => moderate("content", item.id, "REJECTED")}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-oslo-red bg-oslo-red-light px-4 py-3 text-base font-bold text-oslo-red transition active:scale-[0.98] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  Avvis
                </button>
              </div>
            </Card>
          );
        })}

        {data?.reviews.map((item) => {
          const busy = actingOn === `review-${item.id}`;
          return (
            <Card key={item.id}>
              <p className="text-xs font-medium text-oslo-muted">
                Vurdering · {item.pin.title} · {item.rating}/5
              </p>
              <p className="mt-2 text-sm leading-relaxed">{item.comment ?? "(ingen kommentar)"}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => moderate("review", item.id, "APPROVED")}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-oslo-blue px-4 py-3 text-base font-bold text-white disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                  Godkjenn
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => moderate("review", item.id, "REJECTED")}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-oslo-red bg-oslo-red-light px-4 py-3 text-base font-bold text-oslo-red disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  Avvis
                </button>
              </div>
            </Card>
          );
        })}

        {data?.feedback.map((item) => {
          const busy = actingOn === `feedback-${item.id}`;
          return (
            <Card key={item.id}>
              <p className="text-xs font-medium text-oslo-muted">
                Tilbakemelding · {item.politician.name} · {item.rating}/5
              </p>
              <p className="mt-2 text-sm leading-relaxed">{item.comment}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => moderate("feedback", item.id, "APPROVED")}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-oslo-blue px-4 py-3 text-base font-bold text-white disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                  Godkjenn
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => moderate("feedback", item.id, "REJECTED")}
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-oslo-red bg-oslo-red-light px-4 py-3 text-base font-bold text-oslo-red disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  Avvis
                </button>
              </div>
            </Card>
          );
        })}

        {!loading && total === 0 && (
          <Card>
            <p className="text-center text-sm text-oslo-muted">Ingen elementer i køen 🎉</p>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-oslo-border bg-white/95 px-4 py-3 backdrop-blur">
        <Button
          className="w-full py-3 text-base"
          variant="secondary"
          onClick={() => storedKey && load(storedKey)}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Oppdater kø
        </Button>
      </div>
    </div>
  );
}
