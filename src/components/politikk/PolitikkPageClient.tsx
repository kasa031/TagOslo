"use client";

import { useMemo, useState } from "react";
import { MessageSquare, BarChart3, Plus } from "lucide-react";
import type { PoliticianSummary, PollSummary } from "@/types";
import { BYDELER } from "@/lib/constants";
import { formatBydelLabel, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BydelSelect } from "@/components/ui/BydelSelect";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CreatePollModal } from "@/components/politikk/CreatePollModal";
import { FeedbackModal } from "@/components/politikk/FeedbackModal";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";
import {
  hashIndex,
  POLL_BAR_COLORS,
  POLL_BORDER_COLORS,
  POLL_TOP_ACCENTS,
} from "@/lib/summer-colors";

type PolitikkPageClientProps = {
  politicians: PoliticianSummary[];
  polls: PollSummary[];
};

export function PolitikkPageClient({
  politicians: initialPoliticians,
  polls: initialPolls,
}: PolitikkPageClientProps) {
  const [politicians] = useState(initialPoliticians);
  const [polls, setPolls] = useState(initialPolls);
  const [bydelFilter, setBydelFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"polls" | "feedback">("polls");
  const [showPollModal, setShowPollModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedPolitician, setSelectedPolitician] = useState<PoliticianSummary | null>(
    null,
  );
  const [turnstileToken, setTurnstileToken] = useState("");

  const filteredPolls = useMemo(() => {
    if (!bydelFilter) return polls;
    return polls.filter((poll) => poll.bydel === bydelFilter);
  }, [polls, bydelFilter]);

  const filteredPoliticians = useMemo(() => {
    if (!bydelFilter) return politicians;
    return politicians.filter(
      (p) => p.bydel === bydelFilter || p.bydel === null,
    );
  }, [politicians, bydelFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-oslo-ink sm:text-3xl">Politikk</h1>
        <p className="mt-1 text-sm text-oslo-muted">Polls og tilbakemeldinger per bydel.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <BydelSelect
          label="Filtrer bydel"
          showAllOption
          value={bydelFilter}
          onChange={(e) => setBydelFilter(e.target.value)}
          className="sm:max-w-xs"
        />

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFeedbackModal(true)}>
            <MessageSquare className="h-4 w-4" />
            Gi tilbakemelding
          </Button>
          <Button variant="summer" onClick={() => setShowPollModal(true)}>
            <Plus className="h-4 w-4" />
            Ny poll
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-oslo-border" role="tablist" aria-label="Politikk-faner">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "polls"}
          aria-controls="polls-panel"
          id="polls-tab"
          onClick={() => setActiveTab("polls")}
          className={`flex items-center gap-2 border-b-4 px-4 py-2 text-sm font-bold transition ${
            activeTab === "polls"
              ? "border-summer-coral text-summer-coral"
              : "border-transparent text-oslo-muted hover:text-oslo-ink"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Polls ({filteredPolls.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "feedback"}
          aria-controls="feedback-panel"
          id="feedback-tab"
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-2 border-b-4 px-4 py-2 text-sm font-bold transition ${
            activeTab === "feedback"
              ? "border-summer-turquoise text-summer-turquoise"
              : "border-transparent text-oslo-muted hover:text-oslo-ink"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Politikere ({filteredPoliticians.length})
        </button>
      </div>

      {activeTab === "polls" && (
        <div id="polls-panel" role="tabpanel" aria-labelledby="polls-tab">
          <div className="mb-4">
            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                turnstileToken={turnstileToken}
                onVote={(updated) => {
                  setPolls((prev) =>
                    prev.map((p) => (p.id === updated.id ? updated : p)),
                  );
                }}
              />
            ))}
            {filteredPolls.length === 0 && (
              <Card>
                <p className="text-sm text-oslo-muted">Ingen polls her.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "feedback" && (
        <div id="feedback-panel" role="tabpanel" aria-labelledby="feedback-tab" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPoliticians.map((politician, i) => (
            <Card
              key={politician.id}
              accent={`border-t-4 ${POLL_TOP_ACCENTS[i % POLL_TOP_ACCENTS.length]}`}
            >
              <h3 className="font-bold text-oslo-ink">{politician.name}</h3>
              {politician.party && (
                <Badge variant="summer" colorIndex={i} className="mt-1">
                  {politician.party}
                </Badge>
              )}
              {politician.role && (
                <p className="mt-1 text-xs text-oslo-muted">{politician.role}</p>
              )}
              {politician.avgRating !== null && (
                <p className="mt-3 text-sm">
                  Snitt: <strong>{politician.avgRating.toFixed(1)}</strong> / 5
                  <span className="text-oslo-muted">
                    {" "}
                    ({politician.feedbackCount} tilbakemeldinger)
                  </span>
                </p>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  setSelectedPolitician(politician);
                  setShowFeedbackModal(true);
                }}
              >
                Gi tilbakemelding
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8" title="Bydeler">
        <div className="flex flex-wrap gap-2">
          {BYDELER.map((bydel, i) => (
            <button
              key={bydel.id}
              type="button"
              onClick={() => setBydelFilter(bydelFilter === bydel.id ? "" : bydel.id)}
            >
              <Badge
                variant={bydelFilter === bydel.id ? "summer" : "summer"}
                colorIndex={i}
                className={
                  bydelFilter === bydel.id
                    ? "ring-2 ring-oslo-ink ring-offset-1"
                    : "opacity-80 hover:opacity-100"
                }
              >
                {bydel.label}
              </Badge>
            </button>
          ))}
        </div>
      </Card>

      {showPollModal && (
        <CreatePollModal
          politicians={politicians}
          onClose={() => setShowPollModal(false)}
          onSuccess={(poll) => {
            setPolls((prev) => [poll, ...prev]);
            setShowPollModal(false);
          }}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          politicians={politicians}
          selectedPolitician={selectedPolitician}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedPolitician(null);
          }}
          onSuccess={() => {
            setShowFeedbackModal(false);
            setSelectedPolitician(null);
          }}
        />
      )}
    </div>
  );
}

function PollCard({
  poll,
  turnstileToken,
  onVote,
}: {
  poll: PollSummary;
  turnstileToken: string;
  onVote: (poll: PollSummary) => void;
}) {
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleVote = async (optionId: string) => {
    setVoting(optionId);
    setError("");

    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, turnstileToken: turnstileToken || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Kunne ikke registrere stemme.");
        return;
      }

      onVote(data.poll as PollSummary);
    } catch {
      setError("Kunne ikke registrere stemme.");
    } finally {
      setVoting(null);
    }
  };

  const accentIndex = hashIndex(poll.id, POLL_TOP_ACCENTS.length);
  const topAccent = POLL_TOP_ACCENTS[accentIndex];

  return (
    <Card accent={`border-t-4 ${topAccent}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <Badge variant="summer" colorIndex={accentIndex}>
          {formatBydelLabel(poll.bydel)}
        </Badge>
        <span className="text-xs font-medium text-oslo-muted">{formatDate(poll.createdAt)}</span>
      </div>

      <h3 className="text-lg font-bold text-oslo-ink">{poll.question}</h3>
      {poll.description && (
        <p className="mt-1 text-sm text-oslo-muted">{poll.description}</p>
      )}

      {poll.politicians.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {poll.politicians.map((p, i) => (
            <Badge key={p.id} variant="summer" colorIndex={i + 2}>
              @{p.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        {poll.options.map((option, index) => {
          const barColor = POLL_BAR_COLORS[index % POLL_BAR_COLORS.length];
          const borderColor = POLL_BORDER_COLORS[index % POLL_BORDER_COLORS.length];
          const isVoting = voting === option.id;
          const lightBar = barColor === "bg-summer-sun" || barColor === "bg-summer-lime";
          const badgeClass = lightBar ? `${barColor} text-oslo-ink` : `${barColor} text-white`;

          return (
            <div key={option.id}>
              <button
                type="button"
                disabled={!!voting}
                onClick={() => handleVote(option.id)}
                className={`group w-full rounded-xl border-2 border-oslo-border bg-white p-3 text-left transition hover:border-oslo-ink disabled:opacity-60 ${borderColor} border-l-[6px]`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-oslo-ink">{option.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
                    {option.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-oslo-border bg-white">
                  <div
                    className={`h-full rounded-full transition-all ${barColor} ${isVoting ? "opacity-70" : ""}`}
                    style={{ width: `${Math.max(option.percentage, option.percentage > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-medium text-oslo-muted">{option.votes} stemmer</p>
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs font-bold text-oslo-blue">{poll.totalVotes} stemmer totalt</p>
      {error && <p className="mt-2 text-xs font-bold text-oslo-red">{error}</p>}
    </Card>
  );
}
