// Thin client-side wrappers around the serverless /api endpoints.
// Every function fails soft: on any error it resolves to a shape the pricing
// model treats as "no live data" so the hardcoded fallbacks take over.

async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

// City / airport autocomplete. Throws on failure so the component can show its
// manual-entry fallback (per spec).
export async function searchLocations(keyword, signal) {
  const data = await getJSON(`/api/locations?keyword=${encodeURIComponent(keyword)}`, signal);
  return data.results || [];
}

// Flight search — resolves to null on any failure (→ fallback pricing).
export async function searchFlights(params) {
  try {
    const qs = new URLSearchParams(params).toString();
    const data = await getJSON(`/api/flights?${qs}`);
    return data.found ? data : null;
  } catch {
    return null;
  }
}

// Hotel search — resolves to null on any failure (→ fallback pricing).
export async function searchHotels(params) {
  try {
    const qs = new URLSearchParams(params).toString();
    const data = await getJSON(`/api/hotels?${qs}`);
    return data.found ? data : null;
  } catch {
    return null;
  }
}
