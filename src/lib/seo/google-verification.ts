/** Bracket access — Netlify secrets arrive at runtime. */
function runtimeEnv(name: string): string | undefined {
  return process.env[name];
}

function normalizeGoogleToken(raw: string): string {
  return raw.trim().replace(/^google-site-verification=/i, "");
}

/** Samler tokens for domene + nettadresse-prefiks (kommaseparert eller egne env-variabler). */
export function getGoogleVerificationTokens(): string[] {
  const tokens = new Set<string>();

  const add = (value: string | undefined) => {
    if (!value) return;
    for (const part of value.split(",")) {
      const token = normalizeGoogleToken(part);
      if (token) tokens.add(token);
    }
  };

  add(runtimeEnv("GOOGLE_SITE_VERIFICATION"));
  add(runtimeEnv("GOOGLE_SITE_VERIFICATION_DOMAIN"));
  add(runtimeEnv("GOOGLE_SITE_VERIFICATION_WWW"));

  return [...tokens];
}

/** TXT-post for domene-eiendom i Search Console (legges i Cloudflare/DNS). */
export function getGoogleDnsTxtRecords(): string[] {
  return getGoogleVerificationTokens().map(
    (token) => `google-site-verification=${token}`,
  );
}

export function googleSiteVerificationMetadata():
  | { google: string | string[] }
  | undefined {
  const tokens = getGoogleVerificationTokens();
  if (tokens.length === 0) return undefined;
  return { google: tokens.length === 1 ? tokens[0]! : tokens };
}
