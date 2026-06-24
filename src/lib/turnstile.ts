import { isTurnstileConfigured } from "@/lib/config/free-tier";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  if (!isTurnstileConfigured()) return true;
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY!;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );

  if (!response.ok) return false;

  const data = (await response.json()) as TurnstileResponse;
  return data.success;
}
