import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SeoIntro() {
  return (
    <section
      className="border-t-2 border-oslo-border bg-oslo-sand px-4 py-12 sm:px-6"
      aria-labelledby="om-tagoslo"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="om-tagoslo" className="font-display text-2xl font-bold text-oslo-ink">
          Om {APP_NAME}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-oslo-muted sm:text-lg">
          {APP_NAME} er et gratis kart over Oslo der du kan tagge steder, dele lokalhistorie og
          finne sol på uteserveringer. Sjekk solforhold per adresse, filtrer på bydeler som
          Grünerløkka og Frogner, og bruk hashtags som{" "}
          <Link href="/kart?hashtag=solservering" className="font-semibold text-oslo-blue hover:underline">
            #solservering
          </Link>{" "}
          og{" "}
          <Link href="/kart?hashtag=lokalhistorie" className="font-semibold text-oslo-blue hover:underline">
            #lokalhistorie
          </Link>
          .
        </p>
        <p className="mt-4 text-base leading-relaxed text-oslo-muted sm:text-lg">
          Under{" "}
          <Link href="/politikk" className="font-semibold text-oslo-blue hover:underline">
            politikk
          </Link>{" "}
          kan du gi tilbakemelding til representanter i Oslo bystyre, opprette avstemninger og
          stemme per bydel — uten innlogging.
        </p>
      </div>
    </section>
  );
}
