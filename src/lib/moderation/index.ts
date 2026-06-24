export type ModerationResult = {
  approved: boolean;
  reason?: string;
  categories?: string[];
};

const BLOCKED_PATTERNS = [
  /\b(kuk|fitte|hore|jævla|faen\s*deg|drit\s*i)\b/gi,
  /\b(drep|voldta|bomb)\b/gi,
];

const SUSPICIOUS_PATTERNS = [
  /\b\d{8,}\b/,
  /@[\w.-]+\.\w{2,}/,
  /\b\d{3}[\s-]?\d{2}[\s-]?\d{3}\b/,
];

export async function moderateContent(text: string): Promise<ModerationResult> {
  const trimmed = text.trim();

  if (trimmed.length < 3) {
    return { approved: false, reason: "Innholdet er for kort." };
  }

  if (trimmed.length > 5000) {
    return { approved: false, reason: "Innholdet er for langt." };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        approved: false,
        reason: "Innholdet bryter med retningslinjene våre.",
        categories: ["harassment"],
      };
    }
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        approved: false,
        reason: "Av personvernhensyn kan du ikke dele kontaktinformasjon.",
        categories: ["privacy"],
      };
    }
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: trimmed }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          results: Array<{
            flagged: boolean;
            categories: Record<string, boolean>;
          }>;
        };

        const result = data.results[0];
        if (result?.flagged) {
          const flaggedCategories = Object.entries(result.categories)
            .filter(([, flagged]) => flagged)
            .map(([category]) => category);

          return {
            approved: false,
            reason: "Innholdet ble avvist av modereringssystemet.",
            categories: flaggedCategories,
          };
        }
        return { approved: true };
      }
    } catch {
      // OpenAI utilgjengelig – fall tilbake til regelbasert godkjenning (0-kroners modus)
    }
  }

  return { approved: true };
}

export async function moderateTexts(texts: string[]): Promise<ModerationResult> {
  for (const text of texts) {
    if (!text) continue;
    const result = await moderateContent(text);
    if (!result.approved) return result;
  }
  return { approved: true };
}
