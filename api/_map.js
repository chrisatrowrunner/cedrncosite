// Pure response mappers for Duffel payloads — no network, no env, so they are
// unit-testable (see _map.test.js) and shared by the serverless handlers.

let regionDisplay = null;
try {
  regionDisplay = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  regionDisplay = null;
}
export function countryName(code) {
  if (!code) return '';
  try {
    return regionDisplay ? regionDisplay.of(code.toUpperCase()) || code : code;
  } catch {
    return code;
  }
}

// GET /places/suggestions → normalized results the frontend/pricing expect.
export function mapPlaces(data = [], limit = 6) {
  return (data || [])
    .filter((p) => p.iata_code)
    .slice(0, limit)
    .map((p) => ({
      iataCode: p.iata_code,
      cityName: p.city_name || p.name,
      countryCode: p.iata_country_code || '',
      countryName: countryName(p.iata_country_code),
      subType: p.type, // "airport" | "city"
      latitude: p.latitude ?? p.city?.latitude ?? null,
      longitude: p.longitude ?? p.city?.longitude ?? null,
    }));
}

// POST /air/offer-requests → cheapest offer summary, or null if none.
export function cheapestOffer(json) {
  const offers = json?.data?.offers || [];
  if (!offers.length) return null;
  let best = null;
  for (const o of offers) {
    const amt = parseFloat(o.total_amount);
    if (!isFinite(amt)) continue;
    if (!best || amt < best.amt) best = { amt, offer: o };
  }
  if (!best) return null;
  return {
    total: best.amt,
    currency: best.offer.total_currency || 'USD',
    airline: best.offer.owner?.name || best.offer.owner?.iata_code || 'Airline',
  };
}

// SerpAPI engine=google_flights → cheapest itinerary summary, or null if none.
// SerpAPI returns the round-trip total price (USD) for the requested passengers.
export function cheapestGoogleFlight(json) {
  const all = [...(json?.best_flights || []), ...(json?.other_flights || [])];
  let best = null;
  for (const f of all) {
    const price = Number(f.price);
    if (!isFinite(price) || price <= 0) continue;
    if (!best || price < best.price) best = { price, flight: f };
  }
  if (!best) return null;
  const segments = best.flight.flights || [];
  const airline = segments[0]?.airline || best.flight.airline || 'Airline';
  return { total: best.price, currency: 'USD', airline };
}

// POST /stays/search → cheapest per-room-per-night rate matching the star filter.
// `rooms` is how many rooms were requested (rate total covers all of them).
export function cheapestStay(json, nights, ratingSet = [], rooms = 2) {
  const results = json?.data?.results || json?.data || [];
  const nn = nights > 0 ? nights : 1;
  const priced = (Array.isArray(results) ? results : [])
    .map((r) => {
      const acc = r.accommodation || {};
      const amt = parseFloat(r.cheapest_rate_total_amount);
      if (!isFinite(amt)) return null;
      const rating = acc.rating != null ? Number(acc.rating) : null;
      return {
        name: acc.name || 'Hotel',
        rating,
        currency: r.cheapest_rate_currency || 'USD',
        perRoomPerNight: Math.round(amt / rooms / nn),
      };
    })
    .filter(Boolean);
  if (!priced.length) return null;

  // Prefer star-rating matches; fall back to all if the filter excludes everything.
  const set = new Set(ratingSet.map(Number));
  const matches = set.size ? priced.filter((p) => p.rating != null && set.has(p.rating)) : priced;
  const pool = matches.length ? matches : priced;
  pool.sort((a, b) => a.perRoomPerNight - b.perRoomPerNight);
  return { found: true, ...pool[0] };
}
