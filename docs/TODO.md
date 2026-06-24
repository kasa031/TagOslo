# TagOslo – Master TODO

Status for lansering på **tagoslo.no**.

## ✅ Ferdig (kode)

- [x] Rebrand, UI, sikkerhet, SEO, PWA
- [x] Seed med **6 ekte Oslo-steder**, 11 politikere, 1 startpoll
- [x] Kontakt: **ms.tery@icloud.com** (personvern + vilkår)
- [x] Health-sjekk: `/api/health` viser hva som mangler
- [x] Demodata kun når database mangler

## 🔧 Du må gjøre manuelt (11 igjen)

- [x] Kjøp **tagoslo.no**
- [x] Kontakt-e-post valgt (`ms.tery@icloud.com`)
- [ ] **Supabase** → se `docs/LANSERING.md` steg 1
- [ ] **Mapbox** → steg 2
- [ ] `db:push` + `db:seed` → steg 3
- [ ] Supabase Storage bucket `media` → steg 4
- [ ] **GitHub + Netlify** → steg 5–6
- [ ] **Cloudflare DNS** → steg 7
- [ ] Turnstile (anbefalt) → steg 8
- [ ] `MODERATION_ADMIN_KEY` (anbefalt) → steg 8

**Full guide:** [docs/LANSERING.md](LANSERING.md)

## 📋 v2 (etter lansering)

- [ ] PNG PWA-ikoner 192/512
- [ ] Push-varsler, sol+terrasse-algoritme, kart-clustering
- [ ] E-postvarsler (Brevo), R2-lagring, admin for rapporter
