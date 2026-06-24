import { NextResponse } from "next/server";
import { z } from "zod";
import { getOsloCenterSun, getSunConditionsForLocations } from "@/lib/yr/sol-status";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const locationSchema = z.object({
  id: z.string(),
  latitude: z.number().min(59.8).max(60.05),
  longitude: z.number().min(10.6).max(10.95),
});

const bodySchema = z.object({
  locations: z.array(locationSchema).min(1).max(50),
  at: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`sol:${clientKey}`, 30, 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange forespørsler." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const atParam = searchParams.get("at");
  const at = atParam ? new Date(atParam) : new Date();

  if (Number.isNaN(at.getTime())) {
    return NextResponse.json({ error: "Ugyldig tidspunkt." }, { status: 400 });
  }

  const oslo = await getOsloCenterSun(at);
  return NextResponse.json({ oslo, conditions: [oslo] });
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`sol:${clientKey}`, 30, 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange forespørsler." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
    }

    const at = parsed.data.at ? new Date(parsed.data.at) : new Date();
    if (Number.isNaN(at.getTime())) {
      return NextResponse.json({ error: "Ugyldig tidspunkt." }, { status: 400 });
    }

    const [conditions, oslo] = await Promise.all([
      getSunConditionsForLocations(parsed.data.locations, at),
      getOsloCenterSun(at),
    ]);

    return NextResponse.json({
      checkedAt: at.toISOString(),
      source: "yr.no / MET Norway",
      oslo,
      conditions,
    });
  } catch {
    return NextResponse.json({ error: "Kunne ikke hente solforhold." }, { status: 500 });
  }
}
