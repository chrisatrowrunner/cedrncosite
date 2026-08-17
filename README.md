# Cedr & Co — Website & Trip Estimator

Premium travel-companionship marketing site (homepage + pricing) with a live trip
estimator. Single **Vite + React** codebase; the estimator's flight/hotel/place
lookups run through **serverless functions** so the Duffel token never reaches the
browser.

## Stack

- **Frontend:** React 18 + React Router (Vite build)
- **Backend:** serverless functions in `/api` (Vercel Functions / Node 18+)
- **External API:** [Duffel](https://duffel.com/developers) — Places (autocomplete), Air Offer Requests (flights), Stays (hotels)
- **Deploy target:** Vercel (frontend + `/api` in one project)

## Project structure

```
app/
├── api/                     # serverless functions (server-side only)
│   ├── _duffel.js           #   shared transport (bearer auth + versioned fetch)
│   ├── _map.js              #   pure Duffel response mappers (unit-tested)
│   ├── _map.test.js         #   11 assertions — `npm run test:duffel`
│   ├── locations.js         #   GET /api/locations  → Duffel Places suggestions
│   ├── flights.js           #   GET /api/flights    → Duffel Air Offer Requests
│   └── hotels.js            #   GET /api/hotels      → Duffel Stays search
├── src/
│   ├── lib/
│   │   ├── pricing.js       # pure pricing model (tiers, regions, all cost math)
│   │   ├── pricing.test.js  # 40 assertions — `npm run test:pricing`
│   │   └── api.js           # client fetch wrappers (fail soft → fallbacks)
│   ├── components/          # Nav, Footer, CityAutocomplete, Segmented, EstimateBreakdown, Azulejo
│   ├── pages/               # Home.jsx (12 sections), Pricing.jsx (estimator)
│   └── styles/index.css     # design system + estimator styles
├── public/assets/img/       # photos + azulejo motif + city artwork
├── .env.example             # required env vars
└── vercel.json              # SPA rewrites + build config
```

## Local development

1. **Install**
   ```bash
   npm install
   ```
2. **Add your Duffel token** — copy `.env.example` to `.env` and fill it in
   (see “Getting a Duffel token” below).
   ```bash
   cp .env.example .env
   ```
3. **Run with the serverless functions** (recommended — matches production):
   ```bash
   npm i -g vercel        # once
   vercel dev             # serves the app AND /api on http://localhost:3000
   ```
   Or run the **frontend only** (the estimator then uses its hardcoded fallbacks,
   because `/api` isn't running):
   ```bash
   npm run dev            # http://localhost:5173  (proxies /api → localhost:3000)
   ```
4. **Run the tests**
   ```bash
   npm test               # pricing model + Duffel response mappers
   ```

> **No token? The site still works.** Every API call fails soft: the city fields
> fall back to plain manual entry, and flight/hotel prices fall back to hardcoded
> regional estimates (flagged in the breakdown). Add a token to switch on live
> pricing — no code changes needed.

## Getting a Duffel token

1. Create a free account at <https://app.duffel.com>.
2. **Developers → Access tokens → Create token.** Copy it (starts with `duffel_test_`).
3. Put it in `.env` (local) and in your Vercel project’s **Environment Variables**:
   - `DUFFEL_ACCESS_TOKEN`
4. **Test vs live:** the token itself decides — `duffel_test_…` uses sandbox data
   (free), `duffel_live_…` uses live inventory (requires an activated Duffel
   account). Same API host either way; just swap the token to go live.

## Deploy to Vercel

1. Push this `app/` directory to a Git repo (or set Vercel’s **Root Directory** to `app`).
2. Import the repo at <https://vercel.com/new>. Framework preset: **Vite**.
3. Add `DUFFEL_ACCESS_TOKEN` under **Settings → Environment Variables**.
4. Deploy. The `/api/*` files become serverless functions automatically; everything
   else is served as the static SPA (client-side routing via `vercel.json` rewrites).

## How the estimator uses Duffel

- **Autocomplete** → `GET /places/suggestions?query=`. Each suggestion is shown as
  “City, Country (IATA)”. On select, the app stores the **IATA code** (for flights)
  and the place’s **coordinates** (for the Stays search).
- **Flights** → `POST /air/offer-requests` with both slices (out + return), the
  cabin class, and the passenger count (**solo = 2, couple = 3** — always includes
  Christopher). The cheapest returned offer’s airline + total price is used.
  Business Class with no inventory falls back to Premium Economy, flagged.
- **Hotels** → `POST /stays/search` for **2 rooms** at the destination coordinates,
  filtered by star rating (Budget 2–3, Comfortable 3–4, Luxury 5). The cheapest
  matching property’s per-room-per-night rate is used.

## Pricing model (summary)

All figures USD. Implemented in `src/lib/pricing.js` and locked by `pricing.test.js`.

- **Service fee** = day rate × nights. Solo day rate by destination tier
  (Tier 1 $650 / Tier 2 $725 / Tier 3 $800); **Couple = $1,000/day flat**.
  Unknown destinations default to **Tier 2** and are flagged.
- **Seats:** Solo = 2 (client + Christopher), Couple = 3 (2 clients + Christopher).
  **Hotel rooms = 2** in both cases (clients share one room, Christopher his own).
- **Line items:** flights, hotels (2 rooms × nights), ground transport, food
  (2 people solo / 3 couple), experiences (per client), travel insurance
  (clients only; couple = solo × 1.6), and a flat **$120 BOS transport**.
- **Totals:** subtotal + 10% buffer + service fee → **grand total rounded up to the
  nearest $500**. Displayed range = −8% / +12%, each rounded to the nearest $500.

## Notes

- Google Fonts (Cormorant Garamond, Lora, Inter) load via `<link>` in `index.html`.
- The destination **city photos** use real photos when present and fall back to the
  on-brand vector art otherwise. To use real photos, drop these files into
  `public/assets/img/`: `porto.jpg`, `rome.jpg`, `tokyo.jpg`, `nyc.jpg`. Each card
  loads `<slug>.jpg` and automatically falls back to `<slug>.svg` if the photo is
  missing — so no code change is needed to add them.
- Duffel’s Stays response shape can evolve; parsing lives in `api/_map.js`
  (`cheapestStay`) and is covered by `api/_map.test.js` if you need to adjust it.
