import Link from "next/link";
import { APP_DOMAIN, APP_NAME, CONTACT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata(
  "Personvernerklæring",
  `Personvernerklæring for ${APP_NAME} (${APP_DOMAIN}). Hvordan vi behandler data når du tagger steder og deltar i avstemninger.`,
  "/personvern",
  { noIndex: false },
);

export default function PersonvernPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-oslo-ink">Personvernerklæring</h1>
      <p className="mt-2 text-sm text-oslo-muted">Sist oppdatert: {new Date().getFullYear()}</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-oslo-ink">
        <section>
          <h2 className="text-lg font-semibold">1. Hvem er behandlingsansvarlig?</h2>
          <p className="mt-2 text-sm leading-relaxed text-oslo-muted">
            {APP_NAME} ({APP_DOMAIN}) er en uoffisiell plattform for Oslo. Behandlingsansvarlig
            er domene-eier. Kontakt:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-oslo-blue underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. Hvilke data samles inn?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-oslo-muted">
            <li>Innhold du legger ut (tekst, bilder, vurderinger, polls)</li>
            <li>Valgfritt kallenavn – vi krever ikke fullt navn</li>
            <li>Teknisk data (IP-hash for stemmegivning, nettleser for bot-beskyttelse)</li>
            <li>Koordinater og adresser du knytter til steder på kartet</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Formål</h2>
          <p className="mt-2 text-sm leading-relaxed text-oslo-muted">
            Data brukes til å vise kartinnhold, moderere innlegg, vise solforhold og
            muliggjøre demokratisk deltakelse per bydel. Vi selger ikke personopplysninger.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Lagring og tjenester</h2>
          <p className="mt-2 text-sm leading-relaxed text-oslo-muted">
            Data lagres hos Supabase (database og filer), hostes på Netlify, og kart/vær
            hentes fra Mapbox og MET/Yr. Se{" "}
            <Link href="/vilkar" className="text-oslo-blue underline">
              brukervilkår
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Dine rettigheter</h2>
          <p className="mt-2 text-sm leading-relaxed text-oslo-muted">
            Du kan be om innsyn, retting eller sletting av innhold du har lagt ut. Send
            forespørsel til{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-oslo-blue underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Informasjonskapsler</h2>
          <p className="mt-2 text-sm leading-relaxed text-oslo-muted">
            Nettsiden bruker nødvendige cookies for funksjonalitet og valgfritt Cloudflare
            Turnstile for bot-beskyttelse. Ingen reklame-cookies.
          </p>
        </section>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm text-oslo-blue hover:underline">
        ← Tilbake til forsiden
      </Link>
    </div>
  );
}
