import { NextRequest, NextResponse } from "next/server";
import { lookupBydelFromCoordinates } from "@/lib/bydel-lookup";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Ugyldige koordinater." }, { status: 400 });
  }

  const result = lookupBydelFromCoordinates(lat, lng);

  if (!result) {
    return NextResponse.json(
      { error: "Koordinatene ligger utenfor Oslo." },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
