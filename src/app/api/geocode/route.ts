import { NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocoding";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { isMapboxConfigured } from "@/lib/config/free-tier";

export async function GET(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`geocode:${clientKey}`, 60, 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange søk. Prøv igjen om litt." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "Søket er for langt." }, { status: 400 });
  }

  if (!isMapboxConfigured()) {
    return NextResponse.json(
      { error: "Mapbox-token mangler. Legg inn NEXT_PUBLIC_MAPBOX_TOKEN." },
      { status: 503 },
    );
  }

  const results = await geocodeAddress(query);
  return NextResponse.json(results);
}
