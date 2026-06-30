import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata(
  "Politikk i Oslo",
  "Gi tilbakemelding til politikere, opprett avstemninger og stem per bydel i Oslo bystyre.",
  "/politikk",
  { keywords: ["Oslo politikk", "bystyre", "avstemning", "tilbakemelding", "bydeler"] },
);

export default function PolitikkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Forside", path: "/" },
          { name: "Politikk", path: "/politikk" },
        ])}
      />
      {children}
    </>
  );
}
