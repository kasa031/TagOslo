import Link from "next/link";
import { APP_DOMAIN, APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t-2 border-oslo-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-oslo-muted">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-oslo-ink">{APP_NAME}</span> ·{" "}
            {APP_DOMAIN}
          </p>
          <nav className="flex flex-wrap gap-4 text-sm" aria-label="Bunnmeny">
            <Link href="/personvern" className="text-oslo-muted hover:text-oslo-blue">
              Personvern
            </Link>
            <Link href="/vilkar" className="text-oslo-muted hover:text-oslo-blue">
              Vilkår
            </Link>
            <Link href="/kart" className="text-oslo-muted hover:text-oslo-blue">
              Kart
            </Link>
            <Link href="/politikk" className="text-oslo-muted hover:text-oslo-blue">
              Politikk
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
