"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type AddReviewFormProps = {
  pinId: string;
  onSuccess: () => void;
};

export function AddReviewForm({ pinId, onSuccess }: AddReviewFormProps) {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [authorAlias, setAuthorAlias] = useState("");
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
      const response = await fetch(`/api/pins/${pinId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment || undefined,
          authorAlias: authorAlias || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Noe gikk galt.");
        return;
      }

      setSuccessMessage(data.message ?? "Anmeldelse publisert!");
      setComment("");
      setAuthorAlias("");
      onSuccess();
    } catch {
      setError("Kunne ikke lagre anmeldelse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-oslo-border pt-4">
      <p className="text-sm font-semibold text-oslo-ink">Gi vurdering</p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`${value} stjerner`}
          >
            <Star
              className={`h-5 w-5 ${
                value <= rating ? "fill-amber-400 text-amber-400" : "text-oslo-border"
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        label="Kommentar (valgfritt)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Hva synes du om stedet?"
      />

      <Input
        label="Kallenavn (valgfritt)"
        value={authorAlias}
        onChange={(e) => setAuthorAlias(e.target.value)}
      />

      <TurnstileWidget
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
      />

      {error && <p className="text-xs text-oslo-red">{error}</p>}
      {successMessage && (
        <p className="text-xs font-medium text-oslo-blue">{successMessage}</p>
      )}

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Lagrer …" : "Send anmeldelse"}
      </Button>
    </form>
  );
}
