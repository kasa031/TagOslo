# TagOslo – 0-kroners oppsett

Domene: **tagoslo.no** (~99 kr/år via f.eks. Domeneshop).

Eneste faste utgift utover dette: **0 kr/mnd**.

## Stack (0 kr/mnd)

| Tjeneste | Rolle | Gratis grense |
|----------|-------|---------------|
| **Netlify** | Hosting | 300 credits/mnd, kommersiell bruk OK |
| **Supabase** | Database + filer | 500 MB DB, 1 GB storage |
| **Cloudflare** | DNS + SSL + Turnstile | Ubegrenset DNS, gratis bot-sjekk |
| **Mapbox** | Kart + geocoding | 50k kart, 100k geocoding/mnd |
| **Yr (MET)** | Sol og vær | Gratis med User-Agent |
| **GitHub** | Kildekode | Gratis |

## Steg 1: Supabase (database)

1. Opprett konto på [supabase.com](https://supabase.com)
2. **New project** → velg region nær Norge (f.eks. Frankfurt)
3. **Project Settings → Database** → kopier **Transaction pooler** URI til `DATABASE_URL`
4. **Project Settings → API** → kopier URL og `anon` key
5. Lokalt:
   ```bash
   npm run db:push
   npx tsx prisma/seed.ts
   ```
6. **Storage** → opprett bucket `media` (public read, authenticated write senere)

## Steg 2: Mapbox (kart)

1. Konto på [mapbox.com](https://mapbox.com) – ingen kredittkort
2. **Access tokens** → kopier default public token
3. Sett `NEXT_PUBLIC_MAPBOX_TOKEN`

## Steg 3: Netlify (hosting)

1. Push kode til **GitHub**
2. [netlify.com](https://netlify.com) → **Add new site** → Import from Git
3. Build command og publish håndteres av `netlify.toml`
4. **Site settings → Environment variables** – lim inn alle fra `.env.example`
5. Deploy

## Steg 4: Cloudflare (domene + DNS)

1. Kjøp `.no` hos Domeneshop (~99 kr/år)
2. Opprett konto på [cloudflare.com](https://cloudflare.com)
3. **Add site** → legg til domenet → Cloudflare gir nameservere
4. Oppdater nameservere hos Domeneshop
5. **DNS** → CNAME `@` eller `www` → `ditt-navn.netlify.app`
6. **Turnstile** (valgfritt) → opprett widget → legg nøkler i env

## Steg 5: Yr (sol)

Sett i Netlify og `.env.local`:

```
MET_USER_AGENT="TagOslo/1.0 ms.tery@icloud.com"
NEXT_PUBLIC_APP_URL="https://tagoslo.no"
```

## Moderering (gratis)

Appen bruker **regelbasert moderering** som standard (0 kr): banneord, kontaktinfo og lenker.

Valgfritt: **Hugging Face Inference** med gratis Read-token (`HUGGINGFACE_API_TOKEN` i Netlify). Bilder sjekkes manuelt i `/admin`.

## Trafikk innenfor gratis

- ~1 000–5 000 brukere/mnd: trygt
- Kartvisninger: debounced søk + cache sparer Mapbox-kvote
- Yr: 10 min cache per koordinat (allerede implementert)

## Når dere vokser ut av gratis

1. Mapbox-varsel i dashboard
2. Supabase 80 % lagring
3. Netlify credits brukt opp → vurder Netlify Pro (~$20/mnd) eller Cloudflare Pages
