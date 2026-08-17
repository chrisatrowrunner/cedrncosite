// Run: node api/_map.test.js   (verifies Duffel response parsing without the network)
import { mapPlaces, cheapestOffer, cheapestStay, cheapestGoogleFlight, countryName } from './_map.js';

let pass = 0, fail = 0;
function eq(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`); }
}

console.log('countryName');
eq('PT → Portugal', countryName('PT'), 'Portugal');
eq('JP → Japan', countryName('JP'), 'Japan');
eq('empty → ""', countryName(''), '');

console.log('\nmapPlaces (/places/suggestions)');
const places = mapPlaces([
  { type: 'airport', name: 'Francisco Sá Carneiro Airport', iata_code: 'OPO', iata_country_code: 'PT', city_name: 'Porto', latitude: 41.24, longitude: -8.67 },
  { type: 'city', name: 'Lisbon', iata_code: 'LIS', iata_country_code: 'PT', latitude: 38.77, longitude: -9.13 },
  { type: 'airport', name: 'No IATA', iata_country_code: 'PT' }, // dropped (no iata_code)
]);
eq('drops entries without IATA', places.length, 2);
eq('airport → city name + country + coords', places[0], {
  iataCode: 'OPO', cityName: 'Porto', countryCode: 'PT', countryName: 'Portugal',
  subType: 'airport', latitude: 41.24, longitude: -8.67,
});
eq('city → uses name when no city_name', places[1].cityName, 'Lisbon');

console.log('\ncheapestOffer (/air/offer-requests)');
eq('picks lowest total_amount + airline', cheapestOffer({
  data: { offers: [
    { total_amount: '1600.00', total_currency: 'USD', owner: { name: 'Lufthansa' } },
    { total_amount: '1480.50', total_currency: 'USD', owner: { name: 'TAP Air Portugal' } },
  ] },
}), { total: 1480.5, currency: 'USD', airline: 'TAP Air Portugal' });
eq('no offers → null', cheapestOffer({ data: { offers: [] } }), null);

console.log('\ncheapestGoogleFlight (SerpAPI engine=google_flights)');
eq('picks lowest price across best + other flights', cheapestGoogleFlight({
  best_flights: [
    { price: 980, flights: [{ airline: 'United' }] },
    { price: 820, flights: [{ airline: 'TAP Air Portugal' }] },
  ],
  other_flights: [
    { price: 760, flights: [{ airline: 'Iberia' }] },
    { price: 1200, flights: [{ airline: 'Lufthansa' }] },
  ],
}), { total: 760, currency: 'USD', airline: 'Iberia' });
eq('no flights → null', cheapestGoogleFlight({ best_flights: [], other_flights: [] }), null);
eq('serp error payload → null', cheapestGoogleFlight({ best_flights: [], other_flights: [], _serpError: 'no results' }), null);

console.log('\ncheapestStay (/stays/search)  — 2 rooms, 7 nights');
const stayJson = { data: { results: [
  { accommodation: { name: 'Budget Inn', rating: 3 }, cheapest_rate_total_amount: '2800.00', cheapest_rate_currency: 'USD' },      // 2800/2/7 = 200
  { accommodation: { name: 'Grand Palace', rating: 5 }, cheapest_rate_total_amount: '4200.00', cheapest_rate_currency: 'USD' },    // 300
  { accommodation: { name: 'Cozy 4', rating: 4 }, cheapest_rate_total_amount: '3080.00', cheapest_rate_currency: 'USD' },          // 220
] } };
eq('filter [3,4] → cheapest matching (Budget Inn @200)', cheapestStay(stayJson, 7, [3, 4], 2),
  { found: true, name: 'Budget Inn', rating: 3, currency: 'USD', perRoomPerNight: 200 });
eq('filter [5] → Grand Palace @300', cheapestStay(stayJson, 7, [5], 2),
  { found: true, name: 'Grand Palace', rating: 5, currency: 'USD', perRoomPerNight: 300 });
eq('no results → null', cheapestStay({ data: { results: [] } }, 7, [3, 4], 2), null);

console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES'} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
