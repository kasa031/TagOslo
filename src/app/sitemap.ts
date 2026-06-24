import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/app-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const routes = ["", "/kart", "/politikk", "/personvern", "/vilkar"];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "daily",
    priority: route === "" ? 1 : 0.8,
  }));
}
