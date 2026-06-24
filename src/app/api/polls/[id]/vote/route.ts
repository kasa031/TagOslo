import { NextResponse } from "next/server";
import { z } from "zod";
import { voteOnPoll } from "@/lib/services/politics";
import { getVoterHash } from "@/lib/voter-hash";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const voteSchema = z.object({
  optionId: z.string(),
  turnstileToken: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`vote:${clientKey}`, 20, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange stemmer." }, { status: 429 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = voteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig stemme." }, { status: 400 });
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
      return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
    }

    const voterHash = await getVoterHash();
    const poll = await voteOnPoll(id, parsed.data.optionId, voterHash);

    if (!poll) {
      return NextResponse.json(
        { error: "Du har allerede stemt, eller poll finnes ikke." },
        { status: 409 },
      );
    }

    return NextResponse.json({ poll });
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
