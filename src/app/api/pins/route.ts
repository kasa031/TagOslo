import { NextResponse } from "next/server";
import { z } from "zod";
import { createMapPin } from "@/lib/services/pins";
import { moderateTexts } from "@/lib/moderation";
import { isWithinOslo } from "@/lib/utils";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const pinSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
  bydel: z.string(),
  category: z.enum(["UTESTED", "SPISESTED", "BYGNING", "PARK", "ANNET"]),
  terraceFacing: z.string().max(2).optional(),
  hashtags: z.array(z.string()).max(10),
  latitude: z.number(),
  longitude: z.number(),
  authorAlias: z.string().max(40).optional(),
  story: z.string().max(3000).optional(),
  turnstileToken: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bydel = searchParams.get("bydel") ?? undefined;

  const { getMapPins } = await import("@/lib/services/pins");
  const pins = await getMapPins(bydel);
  return NextResponse.json({ pins });
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`pin:${clientKey}`, 10, 60 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange forespørsler." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = pinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ugyldig data. Sjekk feltene og prøv igjen." },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (!(await verifyTurnstile(data.turnstileToken))) {
      return NextResponse.json(
        { error: "Bot-sjekk feilet. Prøv igjen." },
        { status: 403 },
      );
    }

    if (!isWithinOslo(data.latitude, data.longitude)) {
      return NextResponse.json(
        { error: "Stedet må ligge innenfor Oslo." },
        { status: 400 },
      );
    }

    const moderation = await moderateTexts([
      data.title,
      data.description ?? "",
      data.story ?? "",
      data.authorAlias ?? "",
    ]);

    if (!moderation.approved) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 });
    }

    const pin = await createMapPin(data);
    return NextResponse.json({ pin }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
