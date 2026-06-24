"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type ModerationData = {
  contents: Array<{ id: string; textContent: string | null; pin: { title: string } }>;
  reviews: Array<{ id: string; comment: string | null; pin: { title: string } }>;
  feedback: Array<{ id: string; comment: string; politician: { name: string } }>;
};

export default function AdminModerationPage() {
  const [key, setKey] = useState("");
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [data, setData] = useState<ModerationData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved =
      sessionStorage.getItem("tagoslo-admin-key") ??
      sessionStorage.getItem("osloliv-admin-key");
    if (saved) setStoredKey(saved);
  }, []);

  const load = useCallback(async (adminKey: string) => {
    setError("");
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
  }, []);

  useEffect(() => {
    if (storedKey) load(storedKey);
  }, [storedKey, load]);

  const moderate = async (
    type: "content" | "review" | "feedback",
    id: string,
    action: "APPROVED" | "REJECTED",
  ) => {
    if (!storedKey) return;

    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, id, action }),
    });

    load(storedKey);
  };

  if (!storedKey) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card title="Admin moderering">
          <p className="mb-4 text-sm text-oslo-muted">
            Skriv inn `MODERATION_ADMIN_KEY` fra miljøvariabler.
          </p>
          <Input
            label="Admin-nøkkel"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          {error && <p className="mt-2 text-sm text-oslo-red">{error}</p>}
          <Button className="mt-4 w-full" onClick={() => load(key)}>
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-oslo-ink">Modereringskø</h1>
      <p className="mt-1 text-sm text-oslo-muted">{total} elementer venter</p>

      <div className="mt-6 space-y-4">
        {data?.contents.map((item) => (
          <Card key={item.id}>
            <p className="text-xs text-oslo-muted">Innhold · {item.pin.title}</p>
            <p className="mt-1 text-sm">{item.textContent ?? "(media)"}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => moderate("content", item.id, "APPROVED")}>
                Godkjenn
              </Button>
              <Button size="sm" variant="danger" onClick={() => moderate("content", item.id, "REJECTED")}>
                Avvis
              </Button>
            </div>
          </Card>
        ))}

        {data?.reviews.map((item) => (
          <Card key={item.id}>
            <p className="text-xs text-oslo-muted">Anmeldelse · {item.pin.title}</p>
            <p className="mt-1 text-sm">{item.comment}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => moderate("review", item.id, "APPROVED")}>
                Godkjenn
              </Button>
              <Button size="sm" variant="danger" onClick={() => moderate("review", item.id, "REJECTED")}>
                Avvis
              </Button>
            </div>
          </Card>
        ))}

        {data?.feedback.map((item) => (
          <Card key={item.id}>
            <p className="text-xs text-oslo-muted">Tilbakemelding · {item.politician.name}</p>
            <p className="mt-1 text-sm">{item.comment}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => moderate("feedback", item.id, "APPROVED")}>
                Godkjenn
              </Button>
              <Button size="sm" variant="danger" onClick={() => moderate("feedback", item.id, "REJECTED")}>
                Avvis
              </Button>
            </div>
          </Card>
        ))}

        {total === 0 && (
          <p className="text-sm text-oslo-muted">Ingen elementer i køen.</p>
        )}
      </div>
    </div>
  );
}
