import { NextResponse } from "next/server";
import { getPinDetail } from "@/lib/services/pin-detail";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pin = await getPinDetail(id);

  if (!pin) {
    return NextResponse.json({ error: "Sted ikke funnet." }, { status: 404 });
  }

  return NextResponse.json({ pin });
}
