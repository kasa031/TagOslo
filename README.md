# TagOslo

**tagoslo.no** — tag steder på kartet, del Oslo med hashtags, og si din mening til politikere.

Bygget for **0 kr/mnd** (kun domene koster penger).

## Funksjoner

- **Kart** – Mapbox, hashtags (#solservering), bydeler og kategorier
- **Solforhold** – Sanntid fra Yr/MET + solposisjon
- **Politikk** – Tilbakemeldinger, polls og bydelsfilter
- **Moderering** – Regelbasert (gratis), valgfritt OpenAI Moderation

## 0-kroners stack

| Tjeneste | Kostnad |
|----------|---------|
| Netlify (hosting) | 0 kr |
| Supabase (database + filer) | 0 kr |
| Cloudflare (DNS, SSL, Turnstile) | 0 kr |
| Mapbox (kart) | 0 kr |
| Yr/MET (vær/sol) | 0 kr |
| GitHub (kode) | 0 kr |
| **tagoslo.no** | ~99 kr/år |

Full oppsettguide: [docs/LANSERING.md](docs/LANSERING.md) · [docs/GRATIS-OPPSETT.md](docs/GRATIS-OPPSETT.md)

Master TODO: [docs/TODO.md](docs/TODO.md)

## Kom i gang lokalt

```bash
npm install
cp .env.example .env.local
npm run dev
```

Uten Supabase/Mapbox kjører appen med **demodata**.

## Deploy (Netlify)

1. Push til GitHub
2. Koble repo i Netlify
3. Sett miljøvariabler (se `.env.example`)
4. Pek **tagoslo.no** via Cloudflare DNS

## Miljøvariabler (produksjon)

```
NEXT_PUBLIC_APP_URL=https://tagoslo.no
MET_USER_AGENT="TagOslo/1.0 din@epost.no"
```

Se `.env.example` for full liste.
