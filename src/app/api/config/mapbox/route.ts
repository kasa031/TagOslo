import { NextResponse } from "next/server";

/** Public Mapbox token (pk.*) – trygt å eksponere; begrenses i Mapbox-konto. */
export async function GET() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return NextResponse.json({ token: null }, { status: 404 });
  }
  return NextResponse.json({ token });
}
