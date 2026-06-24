import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocoding";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const clientKey = getClientKey(request);
  const rate = checkRateLimit(`geocode-reverse:${clientKey}`, 60, 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "For mange forespørsler." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Ugyldige koordinater." }, { status: 400 });
  }

  const address = await reverseGeocode(lat, lng);
  return NextResponse.json({ address });
}
