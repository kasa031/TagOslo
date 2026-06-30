import type { MetadataRoute } from "next";
import { BYDELER, POPULAR_HASHTAGS } from "@/lib/constants";
import { isDatabaseConfigured } from "@/lib/config/free-tier";
import { getAppUrl } from "@/lib/app-config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/kart`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/politikk`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/personvern`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/vilkar`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const hashtagRoutes: MetadataRoute.Sitemap = POPULAR_HASHTAGS.map((tag) => ({
    url: `${base}/kart?hashtag=${encodeURIComponent(tag.replace("#", ""))}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const bydelRoutes: MetadataRoute.Sitemap = BYDELER.map((bydel) => ({
    url: `${base}/kart?bydel=${bydel.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  let pinRoutes: MetadataRoute.Sitemap = [];

  if (isDatabaseConfigured()) {
    try {
      const pins = await prisma.mapPin.findMany({
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 500,
      });

      pinRoutes = pins.map((pin) => ({
        url: `${base}/kart?pin=${pin.id}`,
        lastModified: pin.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      }));
    } catch {
      pinRoutes = [];
    }
  }

  return [...staticRoutes, ...hashtagRoutes, ...bydelRoutes, ...pinRoutes];
}
