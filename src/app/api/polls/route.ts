import { NextResponse } from "next/server";
import { z } from "zod";
import { createPoll, getPolls } from "@/lib/services/politics";
import { moderateTexts } from "@/lib/moderation";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const pollSchema = z.object({
  question: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
  bydel: z.string(),
  options: z.array(z.string().min(1).max(100)).min(2).max(6),
  politicianIds: z.array(z.string()).max(5),
  authorAlias: z.string().max(40).optional(),
  turnstileToken: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bydel = searchParams.get("bydel") ?? undefined;
  const polls = await getPolls(bydel);
  return NextResponse.json({ polls });
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`poll:${clientKey}`, 5, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange polls." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = pollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig poll-data." }, { status: 400 });
    }

    if (!(await verifyTurnstile(parsed.data.turnstileToken))) {
      return NextResponse.json({ error: "Bot-sjekk feilet." }, { status: 403 });
    }

    const moderation = await moderateTexts([
      parsed.data.question,
      parsed.data.description ?? "",
      ...parsed.data.options,
    ]);

    if (!moderation.approved) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    const poll = await createPoll(parsed.data);
    return NextResponse.json({ poll }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
