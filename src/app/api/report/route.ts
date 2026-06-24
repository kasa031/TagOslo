import { NextResponse } from "next/server";
import { z } from "zod";
import { createContentReport } from "@/lib/services/pin-detail";
import { moderateContent } from "@/lib/moderation";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const reportSchema = z.object({
  targetType: z.enum(["PIN_CONTENT", "PLACE_REVIEW", "POLITICIAN_FEEDBACK"]),
  targetId: z.string(),
  reason: z.string().min(10).max(500),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`report:${clientKey}`, 5, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange rapporter." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig rapport." }, { status: 400 });
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
      return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
    }

    const moderation = await moderateContent(parsed.data.reason);
    if (!moderation.approved) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    await createContentReport(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
