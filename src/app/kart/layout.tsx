import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kart",
  description:
    "Utforsk Oslo på kartet. Tag steder, finn solservering og filtrer på bydeler og hashtags.",
};

export default function KartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
