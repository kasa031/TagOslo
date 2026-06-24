# TagOslo – Lanseringsguide (steg for steg)

Enkel guide for å gå fra mock-data til live på **tagoslo.no**.  
Kontakt: **ms.tery@icloud.com**

Estimert tid: **1–2 timer** (spredt over noen dager mens domenet aktiveres).

---

## Steg 1: Supabase (database) – ca. 15 min

1. Gå til [supabase.com](https://supabase.com) og opprett gratis konto
2. Klikk **New project**
   - Navn: `tagoslo`
   - Region: **Frankfurt** (nærmest Norge)
   - Passord: lag et sterkt passord og **lagre det**
3. Vent til prosjektet er klart (~2 min)
4. Gå til **Project Settings → Database**
   - Kopier **URI** under *Transaction pooler* → dette er `DATABASE_URL`
   - Kopier **URI** under *Session mode* → dette er `DIRECT_URL`
5. Gå til **Project Settings → API**
   - Kopier **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Kopier **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Kopier **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (hemmelig – aldri i frontend)

---

## Steg 2: Mapbox (kart) – ca. 5 min

1. Gå til [mapbox.com](https://mapbox.com) og opprett konto (gratis, uten kort)
2. Gå til **Access tokens**
3. Kopier **Default public token** → `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Steg 3: Koble til lokalt og seed database – ca. 10 min

1. I prosjektmappen, kopier env-fil:
   ```bash
   cp .env.example .env.local
   ```
2. Åpne `.env.local` og lim inn alle verdiene fra steg 1 og 2
3. Kjør i terminal (i prosjektmappen):
   ```bash
   npm install
   npm run db:push
   npm run db:seed
   ```
4. Du skal se:
   ```
   ✓ 11 politikere
   ✓ 6 kart-steder med innhold
   ✓ 1 startpoll
   Ferdig!
   ```
5. Start appen:
   ```bash
   npm run dev
   ```
6. Åpne [http://localhost:3000/kart](http://localhost:3000/kart) – du skal se **6 ekte steder** (Vulkan, Operaen, Sognsvann osv.), ikke demo-data
7. Sjekk [http://localhost:3000/api/health](http://localhost:3000/api/health) – `readyForProduction` blir `true` når database + mapbox + storage er satt

---

## Steg 4: Supabase Storage (bilder/video) – ca. 5 min

1. I Supabase-dashboard: **Storage → New bucket**
2. Navn: **`media`**
3. **Public bucket**: slå PÅ (public read)
4. Opprett bucket

Uten dette kan brukere ikke laste opp bilder – tekst og polls fungerer likevel.

---

## Steg 5: GitHub (kildekode) – ca. 10 min

1. Gå til [github.com](https://github.com) og opprett nytt **privat** repo (f.eks. `tagoslo`)
2. I terminal i prosjektmappen:
   ```bash
   git init
   git add .
   git commit -m "TagOslo klar for lansering"
   git branch -M main
   git remote add origin https://github.com/DITT-BRUkernavn/tagoslo.git
   git push -u origin main
   ```
   *(Bytt ut DITT-BRUkernavn med ditt GitHub-navn)*

**Viktig:** `.env.local` skal **aldri** pushes – den er allerede i `.gitignore`.

---

## Steg 6: Netlify (hosting) – ca. 15 min

1. Gå til [netlify.com](https://netlify.com) og logg inn med GitHub
2. **Add new site → Import an existing project**
3. Velg GitHub-repoet ditt
4. Netlify leser `netlify.toml` automatisk – ikke endre build-innstillinger
5. Før deploy: **Site configuration → Environment variables**
   Lim inn **alle** fra `.env.local`:

   | Variabel | Verdi |
   |----------|--------|
   | `DATABASE_URL` | fra Supabase |
   | `DIRECT_URL` | fra Supabase |
   | `NEXT_PUBLIC_SUPABASE_URL` | fra Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | fra Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | fra Supabase |
   | `NEXT_PUBLIC_MAPBOX_TOKEN` | fra Mapbox |
   | `MET_USER_AGENT` | `TagOslo/1.0 ms.tery@icloud.com` |
   | `NEXT_PUBLIC_APP_URL` | `https://tagoslo.no` |
   | `MODERATION_ADMIN_KEY` | lag en lang tilfeldig streng (f.eks. 32 tegn) |

6. Klikk **Deploy site**
7. Vent til deploy er grønn – du får en midlertidig URL som `tagoslo-xyz.netlify.app`

---

## Steg 7: Domene tagoslo.no – ca. 10 min (+ ventetid)

1. Logg inn hos **Domeneshop** (der du kjøpte domenet)
2. Gå til DNS-innstillinger for `tagoslo.no`
3. Enkleste med Netlify:
   - I Netlify: **Domain management → Add domain** → skriv `tagoslo.no`
   - Netlify viser hva du skal peke DNS til (ofte CNAME eller A-records)
   - Legg inn dette hos Domeneshop
4. Alternativt via **Cloudflare** (gratis SSL + Turnstile):
   - Opprett konto på [cloudflare.com](https://cloudflare.com)
   - Legg til `tagoslo.no`, bytt nameservere hos Domeneshop til Cloudflare sine
   - CNAME `@` → `ditt-navn.netlify.app`

DNS kan ta **15 min – 24 timer** å propagere.

---

## Steg 8: Valgfritt men anbefalt – ca. 10 min

### Cloudflare Turnstile (bot-beskyttelse)
1. Cloudflare → **Turnstile → Add site**
2. Domene: `tagoslo.no`
3. Kopier **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Kopier **Secret key** → `TURNSTILE_SECRET_KEY`
5. Legg inn i Netlify env og **redeploy**

### Admin-panel for moderering
1. Åpne `https://tagoslo.no/admin` (eller Netlify-URL midlertidig)
2. Lim inn `MODERATION_ADMIN_KEY` du satte i Netlify
3. Godkjenn media som venter (bilder/video går til manuell sjekk)

---

## Sjekkliste – alt OK?

- [ ] [tagoslo.no](https://tagoslo.no) åpner forsiden
- [ ] `/kart` viser 6 seed-steder + kart fungerer
- [ ] Adressesøk finner adresser i Oslo
- [ ] `/politikk` viser politikere og startpoll
- [ ] `/api/health` viser `"readyForProduction": true`
- [ ] Du kan legge til nytt sted på kartet
- [ ] Personvern viser `ms.tery@icloud.com`

---

## Feilsøking

| Problem | Løsning |
|---------|---------|
| Tomt kart, ingen pins | Sjekk `DATABASE_URL` i Netlify, kjør `db:seed` på nytt |
| Kart grått / ingen kart | Sjekk `NEXT_PUBLIC_MAPBOX_TOKEN` |
| «Bot-sjekk feilet» | Sett Turnstile-nøkler, eller la dem være tomme (dev-modus) |
| Bilder lastes ikke opp | Opprett Supabase bucket `media` (public) |
| Sol vises ikke | Sett `MET_USER_AGENT="TagOslo/1.0 ms.tery@icloud.com"` |

---

## Etter lansering

- Del lenken med venner og be om innhold på kartet
- Sjekk `/admin` jevnlig for media som venter
- Se `docs/TODO.md` for v2-funksjoner
