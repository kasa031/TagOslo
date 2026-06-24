import { NextResponse } from "next/server";
import {
  isDatabaseConfigured,
  isMapboxConfigured,
  isSupabaseConfigured,
  isTurnstileConfigured,
} from "@/lib/config/free-tier";
import { CONTACT_EMAIL } from "@/lib/contact";

export async function GET() {
  const checks = {
    database: isDatabaseConfigured(),
    mapbox: isMapboxConfigured(),
    supabaseStorage: isSupabaseConfigured(),
    turnstile: isTurnstileConfigured(),
  };

  const readyForProduction =
    checks.database && checks.mapbox && checks.supabaseStorage;

  return NextResponse.json({
    status: "ok",
    service: "TagOslo",
    contact: CONTACT_EMAIL,
    mode: checks.database ? "database" : "offline",
    readyForProduction,
    checks,
    timestamp: new Date().toISOString(),
  });
}
