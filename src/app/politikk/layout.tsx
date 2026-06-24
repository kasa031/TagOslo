import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politikk",
  description:
    "Gi tilbakemelding til politikere, tag dem i polls og stem per bydel i Oslo.",
};

export default function PolitikkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
