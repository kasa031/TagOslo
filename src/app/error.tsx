"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-5xl font-bold text-oslo-red">Oops</p>
      <h1 className="mt-4 text-xl font-bold text-oslo-ink">Noe gikk galt</h1>
      <p className="mt-2 text-sm text-oslo-muted">
        Prøv å laste siden på nytt, eller gå tilbake til forsiden.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Prøv igjen</Button>
        <Link href="/">
          <Button variant="secondary">Forside</Button>
        </Link>
      </div>
    </div>
  );
}
