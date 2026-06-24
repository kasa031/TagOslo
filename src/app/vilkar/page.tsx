import Link from "next/link";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Brukervilkår",
  description: `Brukervilkår for ${APP_NAME}.`,
};

export default function VilkarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-oslo-ink">Brukervilkår</h1>
      <p className="mt-2 text-sm text-oslo-muted">Sist oppdatert: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-oslo-muted">
        <section>
          <h2 className="text-lg font-semibold text-oslo-ink">1. Om tjenesten</h2>
          <p className="mt-2">
            {APP_NAME} er en uoffisiell plattform for Oslo. Den er ikke tilknyttet Oslo
            kommune. Kart, historier og politikk-innhold er brukergenerert.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-oslo-ink">2. Akseptable innlegg</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Respektfull tone – ingen trusler, sjikane eller hat</li>
            <li>Ikke del andres personopplysninger (telefon, e-post, adresse)</li>
            <li>Ikke spam, reklame eller villedende innhold</li>
            <li>Politikk-tilbakemeldinger skal være saklige, ikke personangrep</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-oslo-ink">3. Moderering</h2>
          <p className="mt-2">
            Alt innhold kan modereres automatisk eller manuelt. Vi kan fjerne innhold som
            bryter retningslinjene uten varsel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-oslo-ink">4. Ansvar</h2>
          <p className="mt-2">
            Du er ansvarlig for innholdet du publiserer. {APP_NAME} er ikke ansvarlig for
            nøyaktigheten av brukerinnlegg, solprognoser eller poll-resultater.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-oslo-ink">5. Opphavsrett</h2>
          <p className="mt-2">
            Du beholder opphavsrett til ditt innhold, men gir {APP_NAME} rett til å vise det
            på plattformen. Ikke last opp materiale du ikke har rettigheter til.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-oslo-ink">6. Kontakt</h2>
          <p className="mt-2">
            Spørsmål om tjenesten eller innhold på plattformen:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-oslo-blue underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm text-oslo-blue hover:underline">
        ← Tilbake til forsiden
      </Link>
    </div>
  );
}
