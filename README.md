# TagOslo

**tagoslo.no** — et levende kart over Oslo, bygget av folk som bor her.

## Visjon

Oslo er full av steder med historier — et hus der noen vokste opp, en kafé som har vært møteplass i årevis, et hjørne der solen treffer perfekt om våren. Mye av dette finnes bare i minner, bilder i skuffer og samtaler på gata.

TagOslo gjør det enkelt å **tagge en adresse** og knytte historien til stedet. Du legger inn adressen, skriver det du vet — eller det du har hørt — og tagger med hashtags som `#lokalhistorie`. Andre kan **søke opp adressen** og se hva som er delt: hvem som bodde der, hva bygningen har vært, små detaljer som ellers forsvinner.

Målet er et felles, søkbart lag av Oslo-historie: ikke bare landemerker og museer, men **vanlige hus og gater** som betyr noe for noen. Over tid kan et nabolag, en bydel og hele byen få et rikere bilde av seg selv — laget av de som kjenner den best.

I tillegg finner du solforhold på kartet og kan si din mening til politikere per bydel — men kjernen er enkel: **tag stedet, del historien, la andre finne den igjen.**

Bygget for **0 kr/mnd** (kun domene koster penger).

## Funksjoner

- **Adresser og historie** – Søk adresse, tag stedet, del tekst og bilder med hashtags
- **Kart** – Mapbox, hashtags (#lokalhistorie, #solservering), bydeler og kategorier
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

Uten Supabase/Mapbox kjører appen lokalt, men uten kart og lagring av innhold.

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
