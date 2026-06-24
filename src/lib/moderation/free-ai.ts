/**
 * Gratis AI-moderering (valgfritt).
 * - Google Perspective API: gratis nøkkel, god på toxicity
 * - Hugging Face Inference: gratis tier med token
 *
 * Uten nøkkel brukes kun regelbasert filter.
 */

const PERSPECTIVE_TOXICITY_THRESHOLD = 0.82;
const HF_TOXIC_THRESHOLD = 0.75;

export type FreeAiProvider = "none" | "perspective" | "huggingface";

export function getFreeAiProvider(): FreeAiProvider {
  const explicit = process.env.MODERATION_AI?.toLowerCase();
  if (explicit === "none") return "none";
  if (explicit === "perspective" && process.env.PERSPECTIVE_API_KEY) return "perspective";
  if (explicit === "huggingface" && process.env.HUGGINGFACE_API_TOKEN) return "huggingface";

  if (process.env.PERSPECTIVE_API_KEY) return "perspective";
  if (process.env.HUGGINGFACE_API_TOKEN) return "huggingface";
  return "none";
}

export function isFreeAiModerationConfigured(): boolean {
  return getFreeAiProvider() !== "none";
}

async function checkPerspective(text: string): Promise<boolean> {
  const key = process.env.PERSPECTIVE_API_KEY;
  if (!key) return true;

  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text },
        languages: ["no", "nb", "en"],
        requestedAttributes: { TOXICITY: {}, INSULT: {}, THREAT: {} },
      }),
    },
  );

  if (!response.ok) return true;

  const data = (await response.json()) as {
    attributeScores?: Record<string, { summaryScore?: { value?: number } }>;
  };

  const scores = [
    data.attributeScores?.TOXICITY?.summaryScore?.value ?? 0,
    data.attributeScores?.INSULT?.summaryScore?.value ?? 0,
    data.attributeScores?.THREAT?.summaryScore?.value ?? 0,
  ];

  return Math.max(...scores) < PERSPECTIVE_TOXICITY_THRESHOLD;
}

async function checkHuggingFace(text: string): Promise<boolean> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) return true;

  const model =
    process.env.HUGGINGFACE_MODERATION_MODEL ?? "unitary/toxic-bert";

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text.slice(0, 512) }),
  });

  if (!response.ok) return true;

  const data = (await response.json()) as
    | Array<{ label: string; score: number }>
    | Array<Array<{ label: string; score: number }>>;

  const raw = data[0];
  const labels: Array<{ label: string; score: number }> = Array.isArray(raw)
    ? raw
    : Array.isArray(data)
      ? (data as Array<{ label: string; score: number }>)
      : [];

  if (labels.length === 0) return true;

  const toxic = labels.find((entry) =>
    /toxic|hate|obscene|insult|threat/i.test(entry.label),
  );
  if (!toxic) return true;

  const isNegative = /toxic|hate|obscene|insult|threat/i.test(toxic.label);
  return !(isNegative && toxic.score >= HF_TOXIC_THRESHOLD);
}

/** Returnerer true hvis teksten er OK etter gratis AI-sjekk (eller hvis AI er av). */
export async function passesFreeAiCheck(text: string): Promise<boolean> {
  const provider = getFreeAiProvider();
  if (provider === "none") return true;

  try {
    if (provider === "perspective") return await checkPerspective(text);
    return await checkHuggingFace(text);
  } catch {
    return true;
  }
}
