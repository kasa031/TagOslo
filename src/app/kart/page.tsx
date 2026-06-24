import { Suspense } from "react";
import { KartPageClient } from "@/components/kart/KartPageClient";
import { getMapPins } from "@/lib/services/pins";

function KartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-sm text-oslo-muted">Laster kart …</p>
    </div>
  );
}

export default async function KartPage() {
  const pins = await getMapPins();

  return (
    <Suspense fallback={<KartLoading />}>
      <KartPageClient initialPins={pins} />
    </Suspense>
  );
}
