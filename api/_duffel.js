// Shared Duffel transport for the serverless functions.
// Files prefixed with "_" are NOT exposed as routes by Vercel — this is a helper module.
//
// Credentials live only on the server (env var); the browser never sees them.
//   DUFFEL_ACCESS_TOKEN   (required)
//
// Sandbox vs live: Duffel uses the same host for both — a token that starts with
// `duffel_test_` hits sandbox data, `duffel_live_` hits live inventory. Just swap
// the token; no URL change needed.

const BASE = 'https://api.duffel.com';
const DUFFEL_VERSION = process.env.DUFFEL_VERSION || 'v2';

export function duffelConfigured() {
  return Boolean(process.env.DUFFEL_ACCESS_TOKEN);
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
    'Duffel-Version': DUFFEL_VERSION,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function request(method, path, { params, body } = {}) {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Duffel ${method} ${path} failed (${res.status})`);
    err.status = res.status;
    err.detail = json;
    throw err;
  }
  return json;
}

export const duffelGet = (path, params) => request('GET', path, { params });
export const duffelPost = (path, body) => request('POST', path, { body });

// Consistent JSON responses.
export function send(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}
