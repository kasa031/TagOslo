"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type ReportButtonProps = {
  targetType: "PIN_CONTENT" | "PLACE_REVIEW" | "POLITICIAN_FEEDBACK";
  targetId: string;
};

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async () => {
    if (reason.length < 10) return;
    setStatus("loading");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });

      if (response.ok) {
        setStatus("done");
        setOpen(false);
        setReason("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return <p className="text-xs text-oslo-muted">Takk, rapporten er mottatt.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-oslo-muted hover:text-oslo-red"
      >
        <Flag className="h-3 w-3" />
        Rapporter
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-oslo-border p-3">
      <Textarea
        label="Hvorfor rapporterer du dette?"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Beskriv problemet …"
      />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Avbryt
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={reason.length < 10 || status === "loading"}
          onClick={submit}
        >
          Send rapport
        </Button>
      </div>
      {status === "error" && (
        <p className="text-xs text-oslo-red">Kunne ikke sende rapport.</p>
      )}
    </div>
  );
}
