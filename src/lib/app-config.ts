import { APP_DOMAIN, CONTACT_EMAIL } from "@/lib/constants";

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return `https://${APP_DOMAIN}`;
}

export function getMetUserAgent(): string {
  return (
    process.env.MET_USER_AGENT ??
    `TagOslo/1.0 (${getAppUrl()}; ${CONTACT_EMAIL})`
  );
}

export function isAllowedMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const supabaseHost = new URL(supabaseUrl).host;
      if (parsed.host === supabaseHost && parsed.pathname.includes("/storage/v1/object/public/")) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
