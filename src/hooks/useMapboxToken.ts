"use client";

import { useEffect, useState } from "react";

/**
 * Mapbox public token – fra build (NEXT_PUBLIC_*) eller runtime API
 * (nødvendig når env er lagt til på Netlify etter forrige build).
 */
export function useMapboxToken(): { token: string | null; loading: boolean } {
  const buildToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const [token, setToken] = useState(buildToken);
  const [loading, setLoading] = useState(!buildToken);

  useEffect(() => {
    if (buildToken) {
      setToken(buildToken);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch("/api/config/mapbox")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { token?: string } | null) => {
        if (cancelled) return;
        setToken(data?.token ?? "");
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setToken("");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [buildToken]);

  return { token: token || null, loading };
}
