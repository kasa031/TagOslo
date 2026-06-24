import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/constants";
import { getAppUrl } from "@/lib/app-config";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${APP_NAME} – ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Oslo",
    "tagoslo",
    "kart",
    "hashtags",
    "lokalhistorie",
    "solservering",
    "politikk",
    "bydeler",
  ],
  authors: [{ name: APP_NAME, url: appUrl }],
  creator: APP_NAME,
  openGraph: {
    title: `${APP_NAME} – ${APP_TAGLINE}`,
    description: APP_TAGLINE,
    url: appUrl,
    siteName: APP_NAME,
    locale: "nb_NO",
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} – ${APP_TAGLINE}`,
    description: APP_TAGLINE,
    images: ["/og.svg"],
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
  },
};

export const viewport: Viewport = {
  themeColor: "#004f9f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={poppins.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main-content" className="skip-link">
          Hopp til innhold
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
