import { checkRules } from "@/lib/moderation/rules";
import { getFreeAiProvider, isFreeAiModerationConfigured, passesFreeAiCheck } from "@/lib/moderation/free-ai";

export type ModerationResult = {
  approved: boolean;
  reason?: string;
  /** Kan publiseres uten manuell kø (kun trygg tekst). */
  autoApprove: boolean;
  provider?: string;
};

export { isFreeAiModerationConfigured, getFreeAiProvider };

export async function moderateContent(text: string): Promise<ModerationResult> {
  const rules = checkRules(text);
  if (!rules.ok) {
    return { approved: false, reason: rules.reason, autoApprove: false };
  }

  const aiOk = await passesFreeAiCheck(text);
  if (!aiOk) {
    return {
      approved: false,
      reason: "Innholdet bryter med retningslinjene våre.",
      autoApprove: false,
      provider: getFreeAiProvider(),
    };
  }

  return {
    approved: true,
    autoApprove: true,
    provider: getFreeAiProvider(),
  };
}

export async function moderateTexts(texts: string[]): Promise<ModerationResult> {
  for (const text of texts) {
    if (!text?.trim()) continue;
    const result = await moderateContent(text);
    if (!result.approved) return result;
  }

  return {
    approved: true,
    autoApprove: true,
    provider: getFreeAiProvider(),
  };
}

/** Media uten gratis bildeskanning — tekst kan auto-godkjennes, filer manuelt. */
export async function moderateMediaCaption(texts: string[]): Promise<ModerationResult> {
  const textResult = await moderateTexts(texts);
  if (!textResult.approved) return { ...textResult, autoApprove: false };

  return {
    approved: true,
    autoApprove: false,
    provider: getFreeAiProvider(),
  };
}
