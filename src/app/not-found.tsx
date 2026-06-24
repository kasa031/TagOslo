import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-oslo-blue">404</p>
      <h1 className="mt-4 text-xl font-semibold text-oslo-ink">Siden finnes ikke</h1>
      <p className="mt-2 text-sm text-oslo-muted">
        Kanskje du gikk deg vill i Oslo? Prøv kartet i stedet.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/kart"
          className="rounded-lg bg-oslo-blue px-4 py-2 text-sm font-medium text-white hover:bg-oslo-blue-dark"
        >
          Gå til kartet
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-oslo-border px-4 py-2 text-sm font-medium text-oslo-ink hover:bg-oslo-blue-light"
        >
          Forside
        </Link>
      </div>
    </div>
  );
}
