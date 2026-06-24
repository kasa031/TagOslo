import { KartPageClient } from "@/components/kart/KartPageClient";
import { getMapPins } from "@/lib/services/pins";

export default async function KartPage() {
  const pins = await getMapPins();

  return <KartPageClient initialPins={pins} />;
}
