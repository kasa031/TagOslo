import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME, SEO_KEYWORDS } from "@/lib/constants";
import { getAppUrl } from "@/lib/app-config";

const OG_IMAGE = {
  url: "/og.svg",
  width: 1200,
  height: 630,
  alt: APP_NAME,
} as const;

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options?: {
    keywords?: string[];
    noIndex?: boolean;
  },
): Metadata {
  const url = `${getAppUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = `${title} | ${APP_NAME}`;

  return {
    title,
    description,
    keywords: [...(options?.keywords ?? SEO_KEYWORDS)],
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      locale: "nb_NO",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
    robots: options?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function rootMetadata(): Metadata {
  const appUrl = getAppUrl();

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: `${APP_NAME} – Kart, sol og lokalhistorie i Oslo`,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: APP_NAME,
    authors: [{ name: APP_NAME, url: appUrl }],
    creator: APP_NAME,
    publisher: APP_NAME,
    category: "travel",
    openGraph: {
      title: `${APP_NAME} – Kart, sol og lokalhistorie i Oslo`,
      description: APP_DESCRIPTION,
      url: appUrl,
      siteName: APP_NAME,
      locale: "nb_NO",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${APP_NAME} – Kart, sol og lokalhistorie i Oslo`,
      description: APP_DESCRIPTION,
      images: [OG_IMAGE.url],
    },
    alternates: {
      canonical: appUrl,
    },
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
  };
}
