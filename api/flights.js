// GET /api/flights?origin=BOS&destination=OPO&departureDate=2026-09-12&returnDate=2026-09-19&adults=2&cabin=economy
// Flight search via Duffel Offer Requests (POST /air/offer-requests).
// Always `adults` passengers (client(s) + Christopher): solo = 2, couple = 3.
import { duffelPost, duffelConfigured, send } from './_duffel.js';
import { cheapestOffer } from './_map.js';

const VALID_CABIN = new Set(['economy', 'premium_economy', 'business', 'first']);

async function offerRequest({ origin, destination, departureDate, returnDate, passengers, cabin }) {
  const body = {
    data: {
      cabin_class: cabin,
      passengers: Array.from({ length: passengers }, () => ({ type: 'adult' })),
      slices: [
        { origin, destination, departure_date: departureDate },
        { origin: destination, destination: origin, departure_date: returnDate },
      ],
    },
  };
  // return_offers=true (default) returns offers inline with the request.
  const json = await duffelPost('/air/offer-requests?return_offers=true', body);
  return cheapestOffer(json);
}

export default async function handler(req, res) {
  const { origin, destination, departureDate, returnDate } = req.query;
  const passengers = Math.max(1, parseInt(req.query.adults, 10) || 2);
  let cabin = (req.query.cabin || 'economy').toString().toLowerCase();
  if (!VALID_CABIN.has(cabin)) cabin = 'economy';

  if (!origin || !destination || !departureDate || !returnDate) {
    return send(res, 400, { error: 'missing_params' });
  }
  if (!duffelConfigured()) {
    return send(res, 503, { error: 'not_configured' });
  }

  const base = { origin, destination, departureDate, returnDate, passengers };
  try {
    let result = await offerRequest({ ...base, cabin });
    let businessFallback = false;

    // Business selected but no inventory → fall back to Premium Economy, flagged.
    if (!result && cabin === 'business') {
      result = await offerRequest({ ...base, cabin: 'premium_economy' });
      if (result) businessFallback = true;
    }

    if (!result) return send(res, 200, { found: false });
    return send(res, 200, { found: true, ...result, seats: passengers, cabin, businessFallback });
  } catch (err) {
    return send(res, 502, { error: 'duffel_error', message: err.message, found: false });
  }
}
