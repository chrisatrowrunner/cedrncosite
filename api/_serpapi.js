// Shared SerpAPI transport (Google Flights).
// Files prefixed with "_" are NOT exposed as routes by Vercel — this is a helper.
//
// Credential lives only on the server (env var); the browser never sees it.
//   SERPAPI_KEY   (required for live flight pricing)

const BASE = 'https://serpapi.com/search.json';

export function serpapiConfigured() {
  return Boolean(process.env.SERPAPI_KEY);
}

// GET SerpAPI with the given params (api_key is added automatically).
// Throws on transport error; treats a SerpAPI { error } payload as an empty result.
export async function serpapiSearch(params = {}) {
  const url = new URL(BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  url.searchParams.set('api_key', process.env.SERPAPI_KEY);

  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`SerpAPI failed (${res.status})`);
    err.status = res.status;
    err.detail = json;
    throw err;
  }
  if (json.error) {
    // SerpAPI reports "no results" as an error string — treat as empty, not a hard failure.
    return { best_flights: [], other_flights: [], _serpError: json.error };
  }
  return json;
}
