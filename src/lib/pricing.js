// Cedr & Co pricing model — pure, framework-free so it can be unit-tested with Node
// and imported by the React app. All money is in USD.

// ---- Destination classification -------------------------------------------
// region ∈ NA | EU | ASIA | SA   (drives flight & hard-cost fallbacks)
// tier   ∈ 1 | 2 | 3             (drives Christopher's solo day rate)

// Country ISO-2 → { region, tier }
const COUNTRY_MAP = {
  // Tier 1 — English-speaking / easy navigation
  US: { region: 'NA', tier: 1 }, CA: { region: 'NA', tier: 1 },
  GB: { region: 'EU', tier: 1 }, IE: { region: 'EU', tier: 1 },
  AU: { region: 'ASIA', tier: 1 }, NZ: { region: 'ASIA', tier: 1 },
  // Tier 2 — non-English Western (Europe)
  PT: { region: 'EU', tier: 2 }, IT: { region: 'EU', tier: 2 }, ES: { region: 'EU', tier: 2 },
  FR: { region: 'EU', tier: 2 }, GR: { region: 'EU', tier: 2 }, DE: { region: 'EU', tier: 2 },
  NL: { region: 'EU', tier: 2 }, BE: { region: 'EU', tier: 2 }, AT: { region: 'EU', tier: 2 },
  CH: { region: 'EU', tier: 2 }, SE: { region: 'EU', tier: 2 }, NO: { region: 'EU', tier: 2 },
  DK: { region: 'EU', tier: 2 }, FI: { region: 'EU', tier: 2 }, PL: { region: 'EU', tier: 2 },
  CZ: { region: 'EU', tier: 2 }, HU: { region: 'EU', tier: 2 }, HR: { region: 'EU', tier: 2 },
  // Tier 2 — non-English Western (Latin America)
  BR: { region: 'SA', tier: 2 }, AR: { region: 'SA', tier: 2 }, CL: { region: 'SA', tier: 2 },
  CO: { region: 'SA', tier: 2 }, PE: { region: 'SA', tier: 2 }, MX: { region: 'NA', tier: 2 },
  // Tier 3 — complex / non-Western
  JP: { region: 'ASIA', tier: 3 }, CN: { region: 'ASIA', tier: 3 }, KR: { region: 'ASIA', tier: 3 },
  TH: { region: 'ASIA', tier: 3 }, VN: { region: 'ASIA', tier: 3 }, ID: { region: 'ASIA', tier: 3 },
  MY: { region: 'ASIA', tier: 3 }, PH: { region: 'ASIA', tier: 3 }, SG: { region: 'ASIA', tier: 3 },
  IN: { region: 'ASIA', tier: 3 }, AE: { region: 'ASIA', tier: 3 }, QA: { region: 'ASIA', tier: 3 },
  SA: { region: 'ASIA', tier: 3 }, TR: { region: 'ASIA', tier: 3 }, EG: { region: 'ASIA', tier: 3 },
  MA: { region: 'ASIA', tier: 3 },
};

// Keyword fallback (matched against country name / city name / raw text, lowercased)
const KEYWORD_MAP = [
  // Tier 1
  [['united states', 'usa', 'new york', 'boston', 'los angeles', 'chicago', 'seattle', 'miami'], { region: 'NA', tier: 1 }],
  [['canada', 'toronto', 'vancouver', 'montreal'], { region: 'NA', tier: 1 }],
  [['united kingdom', 'england', 'london', 'scotland', 'ireland', 'dublin'], { region: 'EU', tier: 1 }],
  [['australia', 'sydney', 'melbourne', 'new zealand', 'auckland'], { region: 'ASIA', tier: 1 }],
  // Tier 2 Europe
  [['portugal', 'porto', 'lisbon', 'lisboa'], { region: 'EU', tier: 2 }],
  [['italy', 'rome', 'roma', 'milan', 'venice', 'florence'], { region: 'EU', tier: 2 }],
  [['spain', 'madrid', 'barcelona', 'seville'], { region: 'EU', tier: 2 }],
  [['france', 'paris', 'nice', 'lyon'], { region: 'EU', tier: 2 }],
  [['greece', 'athens', 'germany', 'berlin', 'netherlands', 'amsterdam', 'belgium', 'austria', 'vienna', 'switzerland', 'zurich', 'sweden', 'norway', 'denmark', 'poland', 'czech', 'prague', 'croatia'], { region: 'EU', tier: 2 }],
  // Tier 2 South America
  [['brazil', 'rio', 'sao paulo', 'argentina', 'buenos aires', 'chile', 'santiago', 'colombia', 'bogota', 'peru', 'lima'], { region: 'SA', tier: 2 }],
  [['mexico', 'cancun'], { region: 'NA', tier: 2 }],
  // Tier 3
  [['japan', 'tokyo', 'osaka', 'kyoto', 'china', 'beijing', 'shanghai', 'korea', 'seoul', 'thailand', 'bangkok', 'vietnam', 'indonesia', 'bali', 'malaysia', 'philippines', 'singapore', 'india', 'delhi', 'mumbai', 'dubai', 'emirates', 'qatar', 'saudi', 'turkey', 'istanbul', 'egypt', 'cairo', 'morocco'], { region: 'ASIA', tier: 3 }],
];

export function classifyDestination(dest = {}) {
  const code = (dest.countryCode || '').toUpperCase();
  if (code && COUNTRY_MAP[code]) {
    return { ...COUNTRY_MAP[code], recognized: true };
  }
  const hay = [dest.countryName, dest.cityName, dest.raw].filter(Boolean).join(' ').toLowerCase();
  if (hay) {
    for (const [keys, val] of KEYWORD_MAP) {
      if (keys.some((k) => hay.includes(k))) return { ...val, recognized: true };
    }
  }
  // Unknown → default Tier 2, Europe region, flagged as estimate
  return { region: 'EU', tier: 2, recognized: false };
}

// ---- Rate tables -----------------------------------------------------------
const DAY_RATE_BY_TIER = { 1: 650, 2: 725, 3: 800 };
const COUPLE_DAY_RATE = 1000;

const FLIGHT_FALLBACK_PER_SEAT = {
  NA: { economy: 400, premium: 720, business: 1400 },
  EU: { economy: 950, premium: 1710, business: 3325 },
  ASIA: { economy: 1200, premium: 2160, business: 4200 },
  SA: { economy: 900, premium: 1620, business: 3150 },
};

const HOTEL_FALLBACK_PER_ROOM_NIGHT = { budget: 80, comfortable: 145, luxury: 320 };

const GROUND_PER_DAY = {
  NA: { budget: 35, comfortable: 50, luxury: 80 },
  EU: { budget: 40, comfortable: 55, luxury: 90 },
  ASIA: { budget: 25, comfortable: 45, luxury: 75 },
  SA: { budget: 20, comfortable: 35, luxury: 60 },
};

const FOOD_PER_PERSON_DAY = { budget: 40, comfortable: 75, luxury: 140 };
const EXPERIENCES_PER_CLIENT = { budget: 150, comfortable: 440, luxury: 900 };
const INSURANCE_SOLO = { budget: 120, comfortable: 180, luxury: 250 };
const COUPLE_INSURANCE_MULT = 1.6;
const BOS_TRANSPORT = 120;

// ---- Label & param helpers -------------------------------------------------
export const CABIN_LABEL = { economy: 'Economy', premium: 'Premium Economy', business: 'Business Class' };
export const STAR_LABEL = { budget: '2–3 star', comfortable: '3–4 star', luxury: '5 star' };

// Star ratings to accept per trip feel (used to filter Duffel Stays results)
export function starRatingSet(feel) {
  return { budget: [2, 3], comfortable: [3, 4], luxury: [5] }[feel] || [3, 4];
}

// ---- Counts ----------------------------------------------------------------
export function counts(travelers) {
  const clients = travelers === 'couple' ? 2 : 1;
  return { clients, people: clients + 1, seats: clients + 1, rooms: 2 }; // +1 = Christopher
}

export function nightsBetween(departDate, returnDate) {
  const a = new Date(departDate);
  const b = new Date(returnDate);
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

const round500 = (n) => Math.round(n / 500) * 500;
const ceil500 = (n) => Math.ceil(n / 500) * 500;
export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

// ---- Main estimate ---------------------------------------------------------
// inputs: { departDate, returnDate, flightClass, travelers, care, feel, destination }
// live:   { flight: {found,total,airline,seats,businessFallback}|null,
//           hotel:  {found,perRoomPerNight,name,rating}|null }
export function computeEstimate(inputs, live = {}) {
  const { departDate, returnDate, flightClass = 'economy', travelers = 'solo', care = 'no', feel = 'comfortable' } = inputs;
  const nights = nightsBetween(departDate, returnDate);
  if (nights < 1) {
    return { ok: false, error: 'Trip length must be at least 1 night.' };
  }

  const cls = classifyDestination(inputs.destination || {});
  const { region, tier, recognized } = cls;
  const { clients, people, seats, rooms } = counts(travelers);
  const dayRate = travelers === 'couple' ? COUPLE_DAY_RATE : DAY_RATE_BY_TIER[tier];
  const serviceFee = dayRate * nights;

  // Flights — 2 seats (solo) / 3 seats (couple); live total already covers `seats`.
  const flightLive = live.flight && live.flight.found ? live.flight : null;
  let flights, airline, flightEstimated, businessFallback = false, seatsUsed = seats;
  if (flightLive) {
    flights = flightLive.total;
    airline = flightLive.airline || null;
    seatsUsed = flightLive.seats || seats;
    businessFallback = Boolean(flightLive.businessFallback);
    flightEstimated = false;
  } else {
    flights = FLIGHT_FALLBACK_PER_SEAT[region][flightClass] * seats;
    airline = null;
    flightEstimated = true;
  }

  // Hotels — always 2 rooms x nights.
  const hotelLive = live.hotel && live.hotel.found ? live.hotel : null;
  let perRoomNight, hotelName, hotelRating, hotelEstimated;
  if (hotelLive) {
    perRoomNight = hotelLive.perRoomPerNight;
    hotelName = hotelLive.name || null;
    hotelRating = hotelLive.rating || null;
    hotelEstimated = false;
  } else {
    perRoomNight = HOTEL_FALLBACK_PER_ROOM_NIGHT[feel];
    hotelName = null;
    hotelRating = null;
    hotelEstimated = true;
  }
  const hotels = perRoomNight * rooms * nights;

  const ground = GROUND_PER_DAY[region][feel] * nights;
  const food = FOOD_PER_PERSON_DAY[feel] * people * nights;
  const experiences = EXPERIENCES_PER_CLIENT[feel] * clients;
  const insurance = travelers === 'couple'
    ? Math.round(INSURANCE_SOLO[feel] * COUPLE_INSURANCE_MULT)
    : INSURANCE_SOLO[feel];
  const bos = BOS_TRANSPORT;

  const subtotalHard = flights + hotels + ground + food + experiences + insurance + bos;
  const buffer = subtotalHard * 0.1;
  const grandRaw = subtotalHard + buffer + serviceFee;
  const grandTotal = ceil500(grandRaw);
  const rangeLow = round500(grandTotal * 0.92);  // -8%
  const rangeHigh = round500(grandTotal * 1.12); // +12%

  return {
    ok: true,
    nights, region, tier, recognized, dayRate,
    clients, people, seats: seatsUsed, rooms,
    lines: {
      flights: { amount: flights, airline, cabinLabel: CABIN_LABEL[flightClass], seats: seatsUsed, estimated: flightEstimated, businessFallback },
      hotel: { amount: hotels, name: hotelName, rating: hotelRating, starLabel: STAR_LABEL[feel], perRoomNight, rooms, nights, estimated: hotelEstimated },
      ground: { amount: ground, nights, feel },
      food: { amount: food, nights, people, feel },
      experiences: { amount: experiences, feel, clients },
      insurance: { amount: insurance },
      bos: { amount: bos },
    },
    subtotalHard,
    buffer: Math.round(buffer),
    serviceFee,
    grandTotal,
    rangeLow,
    rangeHigh,
    flags: {
      destinationEstimated: !recognized,
      careNoted: care === 'yes',
      livePricingUnavailable: flightEstimated || hotelEstimated,
      businessFallback,
    },
  };
}
