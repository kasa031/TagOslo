/**
 * Gratis AI-moderering via Hugging Face Inference API.
 * Uten HUGGINGFACE_API_TOKEN brukes kun regelbasert filter.
 */

const HF_TOXIC_THRESHOLD = 0.75;

export type FreeAiProvider = "none" | "huggingface";

export function getFreeAiProvider(): FreeAiProvider {
  const explicit = process.env.MODERATION_AI?.toLowerCase();
  if (explicit === "none") return "none";
  if (process.env.HUGGINGFACE_API_TOKEN) return "huggingface";
  return "none";
}

export function isFreeAiModerationConfigured(): boolean {
  return getFreeAiProvider() === "huggingface";
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
  if (getFreeAiProvider() === "none") return true;

  try {
    return await checkHuggingFace(text);
  } catch {
    return true;
  }
}
