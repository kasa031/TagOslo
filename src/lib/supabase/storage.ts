import { isSupabaseConfigured } from "@/lib/config/free-tier";

const BUCKET = "media";

export type UploadResult = {
  url: string;
  path: string;
};

export async function uploadMedia(
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<UploadResult | null> {
  if (!isSupabaseConfigured()) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `uploads/${Date.now()}-${safeName}`;

  const response = await fetch(
    `${baseUrl}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: new Uint8Array(file),
    },
  );

  if (!response.ok) return null;

  const publicUrl = `${baseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  return { url: publicUrl, path };
}

export function getMediaBucketName(): string {
  return BUCKET;
}
