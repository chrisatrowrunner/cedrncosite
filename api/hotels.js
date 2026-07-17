// GET /api/hotels?latitude=41.24&longitude=-8.67&checkInDate=2026-09-12&checkOutDate=2026-09-19&ratings=3,4
// Hotel search via Duffel Stays (POST /stays/search). Always 2 rooms
// (client room + Christopher's room). Star filter comes from trip feel.
import { duffelPost, duffelConfigured, send } from './_duffel.js';
import { cheapestStay } from './_map.js';

const ROOMS = 2;

function nightsBetween(a, b) {
  const d = Math.round((new Date(b) - new Date(a)) / 86400000);
  return d > 0 ? d : 1;
}

export default async function handler(req, res) {
  const { latitude, longitude, checkInDate, checkOutDate } = req.query;
  const ratingSet = (req.query.ratings || '')
    .toString()
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));

  if (!latitude || !longitude || !checkInDate || !checkOutDate) {
    return send(res, 400, { error: 'missing_params' });
  }
  if (!duffelConfigured()) {
    return send(res, 503, { error: 'not_configured' });
  }

  const body = {
    data: {
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      rooms: ROOMS,
      guests: Array.from({ length: ROOMS }, () => ({ type: 'adult' })),
      location: {
        radius: 15,
        geographic_coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
      },
    },
  };

  try {
    const json = await duffelPost('/stays/search', body);
    const nights = nightsBetween(checkInDate, checkOutDate);
    const result = cheapestStay(json, nights, ratingSet, ROOMS);
    if (!result) return send(res, 200, { found: false });
    return send(res, 200, result);
  } catch (err) {
    return send(res, 502, { error: 'duffel_error', message: err.message, found: false });
  }
}
