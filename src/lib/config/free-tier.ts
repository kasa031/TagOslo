export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function isMapboxConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      process.env.TURNSTILE_SECRET_KEY,
  );
}

export const FREE_TIER_LIMITS = {
  mapboxMapLoadsPerMonth: 50_000,
  mapboxGeocodingPerMonth: 100_000,
  supabaseDatabaseMb: 500,
  supabaseStorageGb: 1,
  netlifyCreditsPerMonth: 300,
} as const;
