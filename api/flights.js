// GET /api/flights?origin=BOS&destination=OPO&departureDate=2026-09-12&returnDate=2026-09-19&adults=2&cabin=economy
// Flight search via SerpAPI Google Flights (engine=google_flights).
// Always `adults` passengers (client(s) + Christopher): solo = 2, couple = 3.
import { serpapiSearch, serpapiConfigured } from './_serpapi.js';
import { cheapestGoogleFlight } from './_map.js';
import { send } from './_http.js';

// Our cabin values → Google Flights travel_class (1 Economy, 2 Premium economy, 3 Business, 4 First)
const TRAVEL_CLASS = { economy: 1, premium: 2, business: 3 };

async function googleFlights({ origin, destination, departureDate, returnDate, adults, travelClass }) {
  const json = await serpapiSearch({
    engine: 'google_flights',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departureDate,
    return_date: returnDate,
    travel_class: travelClass,
    adults,
    currency: 'USD',
    hl: 'en',
    gl: 'us',
  });
  return cheapestGoogleFlight(json);
}

export default async function handler(req, res) {
  const { origin, destination, departureDate, returnDate } = req.query;
  const adults = Math.max(1, parseInt(req.query.adults, 10) || 2);
  const cabin = (req.query.cabin || 'economy').toString().toLowerCase();
  const travelClass = TRAVEL_CLASS[cabin] || 1;

  if (!origin || !destination || !departureDate || !returnDate) {
    return send(res, 400, { error: 'missing_params' });
  }
  if (!serpapiConfigured()) {
    return send(res, 503, { error: 'not_configured' });
  }

  const base = { origin, destination, departureDate, returnDate, adults };
  try {
    let result = await googleFlights({ ...base, travelClass });
    let businessFallback = false;

    // Business selected but nothing returned → fall back to Premium Economy, flagged.
    if (!result && cabin === 'business') {
      result = await googleFlights({ ...base, travelClass: 2 });
      if (result) businessFallback = true;
    }

    if (!result) return send(res, 200, { found: false });
    return send(res, 200, { found: true, ...result, seats: adults, cabin, businessFallback });
  } catch (err) {
    return send(res, 502, { error: 'serpapi_error', message: err.message, found: false });
  }
}
