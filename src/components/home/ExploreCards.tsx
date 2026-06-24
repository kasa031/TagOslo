import Link from "next/link";
import { Map, Hash, MessageSquare, ArrowRight } from "lucide-react";

const EXPLORE = [
  {
    href: "/kart",
    icon: Map,
    title: "Kart & sol",
    description: "Sol, adresser og steder i byen.",
    cta: "Åpne kart",
    bg: "bg-oslo-blue-light",
    accent: "border-t-oslo-blue",
    iconBg: "bg-oslo-blue text-white",
  },
  {
    href: "/kart",
    icon: Hash,
    title: "Del & tag",
    description: "Historier, bilder og hashtags.",
    cta: "Tag et sted",
    bg: "bg-oslo-cream/40",
    accent: "border-t-pool-deep",
    iconBg: "bg-pool-deep text-white",
  },
  {
    href: "/politikk",
    icon: MessageSquare,
    title: "Politikk",
    description: "Polls og tilbakemeldinger per bydel.",
    cta: "Se politikk",
    bg: "bg-white",
    accent: "border-t-oslo-red",
    iconBg: "bg-oslo-red text-white",
  },
] as const;

export function ExploreCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h2 className="text-center font-display text-2xl font-bold text-oslo-ink sm:text-3xl">
        Kom i gang
      </h2>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {EXPLORE.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group flex h-full flex-col rounded-2xl border-2 border-oslo-border border-t-4 p-6 transition hover:-translate-y-0.5 ${item.bg} ${item.accent}`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <h3 className="font-display text-xl font-bold text-oslo-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm text-oslo-muted">{item.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-oslo-blue group-hover:gap-2">
                {item.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
