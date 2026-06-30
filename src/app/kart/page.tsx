import type { Metadata } from "next";
import { Suspense } from "react";
import { KartPageClient } from "@/components/kart/KartPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { BYDELER } from "@/lib/constants";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { getMapPins } from "@/lib/services/pins";
import { formatBydelLabel, normalizeHashtag } from "@/lib/utils";

type KartSearchParams = {
  hashtag?: string;
  bydel?: string;
  pin?: string;
};

function KartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-sm text-oslo-muted">Laster kart …</p>
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<KartSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  if (params.pin) {
    const pins = await getMapPins();
    const pin = pins.find((entry) => entry.id === params.pin);
    if (pin) {
      return pageMetadata(
        pin.title,
        pin.description ??
          `${pin.title} på kartet over Oslo. Bydel: ${formatBydelLabel(pin.bydel)}${pin.address ? `, ${pin.address}` : ""}.`,
        `/kart?pin=${params.pin}`,
        { keywords: [...pin.hashtags, formatBydelLabel(pin.bydel), "Oslo kart"] },
      );
    }
  }

  if (params.hashtag) {
    const tag = normalizeHashtag(params.hashtag);
    return pageMetadata(
      `#${tag} i Oslo`,
      `Finn steder tagget med #${tag} på kartet. Sol, adresser og anbefalinger i Oslo.`,
      `/kart?hashtag=${encodeURIComponent(tag)}`,
      { keywords: [tag, "Oslo", "kart", "hashtag"] },
    );
  }

  if (params.bydel) {
    const bydel = BYDELER.find((entry) => entry.id === params.bydel);
    if (bydel) {
      return pageMetadata(
        `Kart — ${bydel.label}`,
        `Utforsk steder, solservering og tips i ${bydel.label}, Oslo. Tag steder og filtrer på kartet.`,
        `/kart?bydel=${params.bydel}`,
        { keywords: [bydel.label, "Oslo kart", "bydel", "solservering"] },
      );
    }
  }

  return pageMetadata(
    "Kart over Oslo",
    "Utforsk Oslo på kartet. Tag steder, finn solservering, filtrer på bydeler og hashtags.",
    "/kart",
  );
}

export default async function KartPage() {
  const pins = await getMapPins();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Forside", path: "/" },
          { name: "Kart", path: "/kart" },
        ])}
      />
      <Suspense fallback={<KartLoading />}>
        <KartPageClient initialPins={pins} />
      </Suspense>
    </>
  );
}
