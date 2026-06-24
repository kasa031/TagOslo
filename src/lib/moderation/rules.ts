/** Regelbasert moderering — gratis, ingen API, kjører alltid først. */

const BLOCKED_PATTERNS = [
  /\b(kuk|kukk|fitte|hore|hora|jævla|jævel|faen\s*deg|drit\s*i|helvete\s*ta|pokker)\b/gi,
  /\b(drep|voldta|bomb|drap|knivstikk)\b/gi,
  /\b(nazi|hitler|jøde\s*fitte)\b/gi,
];

const SUSPICIOUS_PATTERNS = [
  /\b\d{8,}\b/,
  /@[\w.-]+\.\w{2,}/,
  /\b\d{3}[\s-]?\d{2}[\s-]?\d{3}\b/,
  /\b(?:https?:\/\/|www\.)\S+/i,
];

export function normalizeForRules(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/@/g, "a")
    .replace(/\$/g, "s");
}

export function checkRules(text: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = text.trim();

  if (trimmed.length < 3) {
    return { ok: false, reason: "Innholdet er for kort." };
  }

  if (trimmed.length > 5000) {
    return { ok: false, reason: "Innholdet er for langt." };
  }

  const normalized = normalizeForRules(trimmed);

  for (const pattern of BLOCKED_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed) || pattern.test(normalized)) {
      return { ok: false, reason: "Innholdet bryter med retningslinjene våre." };
    }
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed)) {
      return {
        ok: false,
        reason: "Av personvernhensyn kan du ikke dele kontaktinfo eller lenker her.",
      };
    }
  }

  return { ok: true };
}
