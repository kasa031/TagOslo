import { createHash } from "crypto";
import { headers } from "next/headers";

export async function getVoterHash(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for") ?? "unknown";
  const userAgent = headerList.get("user-agent") ?? "unknown";

  return createHash("sha256")
    .update(`${forwarded}:${userAgent}:tagoslo-v1`)
    .digest("hex");
}
