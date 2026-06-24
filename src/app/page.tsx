import Link from "next/link";
import { Map, MessageSquare, Sparkles } from "lucide-react";
import { APP_NAME, APP_TAGLINE, POPULAR_HASHTAGS } from "@/lib/constants";
import { ACCENT_PILLS } from "@/lib/summer-colors";
import { getOsloCenterSun } from "@/lib/yr/sol-status";
import { LiveOsloStrip } from "@/components/home/LiveOsloStrip";
import { ExploreCards } from "@/components/home/ExploreCards";

export default async function HomePage() {
  let osloSun = null;
  try {
    osloSun = await getOsloCenterSun(new Date());
  } catch {
    osloSun = null;
  }

  return (
    <div className="animate-fade-in">
      <LiveOsloStrip oslo={osloSun} />

      <section className="relative overflow-hidden bg-gradient-to-br from-oslo-blue via-oslo-blue-dark to-pool-deep px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-6 top-6 h-32 w-32 rounded-full bg-pool-sky/30" />
        <div className="pointer-events-none absolute bottom-8 left-8 h-24 w-24 rounded-full bg-oslo-red/20" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-oslo-cream px-4 py-1.5 text-sm font-bold text-oslo-ink">
            <Sparkles className="h-4 w-4" />
            {APP_TAGLINE}
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/95 sm:text-xl">
            Kart, sol og meninger fra Oslo.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/kart"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-oslo-cream px-8 py-4 text-base font-bold text-oslo-ink transition hover:bg-white"
            >
              <Map className="h-5 w-5" />
              Kart
            </Link>
            <Link
              href="/politikk"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-oslo-blue"
            >
              <MessageSquare className="h-5 w-5" />
              Politikk
            </Link>
          </div>
        </div>
      </section>

      <ExploreCards />

      <section className="border-t-2 border-oslo-border bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_HASHTAGS.map((tag, i) => (
              <Link
                key={tag}
                href={`/kart?hashtag=${encodeURIComponent(tag.replace("#", ""))}`}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition hover:opacity-90 ${ACCENT_PILLS[i % ACCENT_PILLS.length]}`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
