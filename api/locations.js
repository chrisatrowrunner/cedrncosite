// GET /api/locations?keyword=por
// City & airport autocomplete via Duffel Places (GET /places/suggestions).
import { duffelGet, duffelConfigured, send } from './_duffel.js';
import { mapPlaces } from './_map.js';

export default async function handler(req, res) {
  const keyword = (req.query.keyword || '').toString().trim();
  if (keyword.length < 3) {
    return send(res, 200, { results: [] });
  }
  if (!duffelConfigured()) {
    return send(res, 503, { error: 'not_configured', results: [] });
  }
  try {
    const json = await duffelGet('/places/suggestions', { query: keyword });
    return send(res, 200, { results: mapPlaces(json.data, 6) });
  } catch (err) {
    return send(res, 502, { error: 'duffel_error', message: err.message, results: [] });
  }
}
