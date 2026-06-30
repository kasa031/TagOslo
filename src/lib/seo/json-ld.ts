import { APP_DESCRIPTION, APP_DOMAIN, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { CONTACT_EMAIL } from "@/lib/contact";
import { getAppUrl } from "@/lib/app-config";

export function websiteJsonLd() {
  const url = getAppUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    alternateName: APP_DOMAIN,
    url,
    description: APP_DESCRIPTION,
    inLanguage: "nb-NO",
    publisher: { "@id": `${url}/#organization` },
  };
}

export function organizationJsonLd() {
  const url = getAppUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: APP_NAME,
    url,
    logo: `${url}/icon-512.png`,
    email: CONTACT_EMAIL,
    areaServed: {
      "@type": "City",
      name: "Oslo",
      containedInPlace: { "@type": "Country", name: "Norge" },
    },
  };
}

export function webApplicationJsonLd() {
  const url = getAppUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url,
    description: APP_DESCRIPTION,
    applicationCategory: "TravelApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NOK",
    },
    featureList: [
      "Interaktivt kart over Oslo",
      "Solservering og solforhold",
      "Hashtags og lokalhistorie",
      "Avstemninger og tilbakemeldinger til politikere",
    ],
    slogan: APP_TAGLINE,
    inLanguage: "nb-NO",
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  const base = getAppUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}
