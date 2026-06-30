import Link from "next/link";
import { Map, MessageSquare } from "lucide-react";
import { APP_TAGLINE, POPULAR_HASHTAGS } from "@/lib/constants";
import { ACCENT_PILLS } from "@/lib/summer-colors";
import { getOsloCenterSun } from "@/lib/yr/sol-status";
import { LiveOsloStrip } from "@/components/home/LiveOsloStrip";
import { ExploreCards } from "@/components/home/ExploreCards";
import { SeoIntro } from "@/components/home/SeoIntro";
import { BrandWordmark, Logo } from "@/components/layout/Logo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationJsonLd,
  webApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";

export default async function HomePage() {
  let osloSun = null;
  try {
    osloSun = await getOsloCenterSun(new Date());
  } catch {
    osloSun = null;
  }

  return (
    <div className="animate-fade-in">
      <JsonLd
        data={[websiteJsonLd(), organizationJsonLd(), webApplicationJsonLd()]}
      />
      <LiveOsloStrip oslo={osloSun} />

      <section className="relative overflow-hidden bg-gradient-to-br from-oslo-blue via-oslo-blue-dark to-pool-deep px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-6 top-6 h-32 w-32 rounded-full bg-pool-sky/30" />
        <div className="pointer-events-none absolute bottom-8 left-8 h-24 w-24 rounded-full bg-oslo-red/20" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Logo
            variant="emblem"
            size={144}
            priority
            className="mx-auto h-28 w-28 drop-shadow-xl sm:h-36 sm:w-36"
          />
          <h1 className="mt-6">
            <BrandWordmark
              tone="light"
              className="text-4xl sm:text-5xl md:text-6xl"
            />
          </h1>
          <p className="mt-4 text-lg font-semibold text-oslo-cream sm:text-xl">
            {APP_TAGLINE}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            Tag adresser, del lokalhistorie, sjekk sol og si din mening.
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

      <SeoIntro />

      <section
        className="border-t-2 border-oslo-border bg-white px-4 py-10 sm:px-6"
        aria-labelledby="populaere-hashtags"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="populaere-hashtags" className="font-display text-xl font-bold text-oslo-ink">
            Populære hashtags i Oslo
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
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
