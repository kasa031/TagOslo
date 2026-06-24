import { NextResponse } from "next/server";
import { getPendingModerationItems, moderateItem } from "@/lib/services/pin-detail";

function isAuthorized(request: Request): boolean {
  const key = process.env.MODERATION_ADMIN_KEY;
  if (!key) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Ikke autorisert." }, { status: 401 });
  }

  const items = await getPendingModerationItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Ikke autorisert." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      type: "content" | "review" | "feedback";
      id: string;
      action: "APPROVED" | "REJECTED";
      reason?: string;
    };

    await moderateItem(body.type, body.id, body.action, body.reason);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Intern feil." }, { status: 500 });
  }
}
