import { NextResponse } from "next/server";
import { z } from "zod";
import { addPinReview } from "@/lib/services/pin-detail";
import { moderateContent } from "@/lib/moderation";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  authorAlias: z.string().max(40).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: pinId } = await params;
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`review:${clientKey}`, 10, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange anmeldelser." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig anmeldelse." }, { status: 400 });
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
      return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
    }

    if (parsed.data.comment) {
      const moderation = await moderateContent(parsed.data.comment);
      if (!moderation.approved) {
        return NextResponse.json({ error: moderation.reason }, { status: 422 });
      }
    }

    if (parsed.data.authorAlias) {
      const aliasMod = await moderateContent(parsed.data.authorAlias);
      if (!aliasMod.approved) {
        return NextResponse.json({ error: aliasMod.reason }, { status: 422 });
      }
    }

    const result = await addPinReview({
      pinId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      authorAlias: parsed.data.authorAlias,
      autoApprove: true,
    });

    if (!result) {
      return NextResponse.json({ error: "Kunne ikke lagre anmeldelse." }, { status: 500 });
    }

    return NextResponse.json(
      {
        review: result.review,
        pending: result.pending,
        message: "Anmeldelse publisert!",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
