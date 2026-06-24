import { PolitikkPageClient } from "@/components/politikk/PolitikkPageClient";
import { getPoliticians, getPolls } from "@/lib/services/politics";

export default async function PolitikkPage() {
  const [politicians, polls] = await Promise.all([getPoliticians(), getPolls()]);

  return <PolitikkPageClient politicians={politicians} polls={polls} />;
}
