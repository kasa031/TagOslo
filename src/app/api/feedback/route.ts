import { NextResponse } from "next/server";
import { z } from "zod";
import { createFeedback } from "@/lib/services/politics";
import { moderateContent } from "@/lib/moderation";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

import { BYDELER } from "@/lib/constants";

const bydelIds = ["HELE_OSLO", ...BYDELER.map((b) => b.id)] as const;

const feedbackSchema = z.object({
  politicianId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000),
  bydel: z.enum(bydelIds),
  authorAlias: z.string().max(40).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`feedback:${clientKey}`, 10, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange forespørsler." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig tilbakemelding." }, { status: 400 });
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
      return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
    }

    const moderation = await moderateContent(parsed.data.comment);

    if (!moderation.approved) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    const result = await createFeedback({ ...parsed.data, autoApprove: true });
    return NextResponse.json(
      {
        success: true,
        pending: result.pending,
        message: "Tilbakemelding publisert!",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
