// Run: node src/lib/pricing.test.js
import { computeEstimate, classifyDestination } from './pricing.js';

let pass = 0, fail = 0;
function eq(label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}\n      got:  ${JSON.stringify(got)}\n      want: ${JSON.stringify(want)}`); }
}

console.log('classifyDestination');
eq('Porto by countryCode PT', classifyDestination({ countryCode: 'PT' }), { region: 'EU', tier: 2, recognized: true });
eq('Tokyo by countryCode JP', classifyDestination({ countryCode: 'JP' }), { region: 'ASIA', tier: 3, recognized: true });
eq('NYC by countryCode US', classifyDestination({ countryCode: 'US' }), { region: 'NA', tier: 1, recognized: true });
eq('keyword fallback "Lisbon, Portugal"', classifyDestination({ cityName: 'Lisbon', countryName: 'Portugal' }), { region: 'EU', tier: 2, recognized: true });
eq('unknown → Tier 2 EU, unrecognized', classifyDestination({ countryCode: 'ZZ', cityName: 'Nowhere' }), { region: 'EU', tier: 2, recognized: false });

console.log('\nScenario A — Solo / Porto / Economy / Comfortable / 7 nights / fallbacks');
const a = computeEstimate(
  { departDate: '2026-09-12', returnDate: '2026-09-19', flightClass: 'economy', travelers: 'solo', care: 'no', feel: 'comfortable', destination: { countryCode: 'PT', cityName: 'Porto' } },
  {}
);
eq('nights', a.nights, 7);
eq('tier/region', [a.tier, a.region], [2, 'EU']);
eq('dayRate', a.dayRate, 725);
eq('serviceFee', a.serviceFee, 5075);
eq('flights (950*2)', a.lines.flights.amount, 1900);
eq('hotel (145*2*7)', a.lines.hotel.amount, 2030);
eq('ground (55*7)', a.lines.ground.amount, 385);
eq('food (75*2*7)', a.lines.food.amount, 1050);
eq('experiences (440*1)', a.lines.experiences.amount, 440);
eq('insurance solo comfortable', a.lines.insurance.amount, 180);
eq('bos', a.lines.bos.amount, 120);
eq('subtotalHard', a.subtotalHard, 6105);
eq('grandTotal (ceil 500)', a.grandTotal, 12000);
eq('range low/high', [a.rangeLow, a.rangeHigh], [11000, 13500]);
eq('flags.livePricingUnavailable', a.flags.livePricingUnavailable, true);

console.log('\nScenario B — Couple / Tokyo / Business / Luxury / care yes / 10 nights / fallbacks');
const b = computeEstimate(
  { departDate: '2026-10-01', returnDate: '2026-10-11', flightClass: 'business', travelers: 'couple', care: 'yes', feel: 'luxury', destination: { countryCode: 'JP', cityName: 'Tokyo' } },
  {}
);
eq('seats/people/clients/rooms', [b.seats, b.people, b.clients, b.rooms], [3, 3, 2, 2]);
eq('dayRate couple flat', b.dayRate, 1000);
eq('serviceFee (1000*10)', b.serviceFee, 10000);
eq('flights (4200*3)', b.lines.flights.amount, 12600);
eq('hotel (320*2*10)', b.lines.hotel.amount, 6400);
eq('food (140*3*10)', b.lines.food.amount, 4200);
eq('experiences (900*2)', b.lines.experiences.amount, 1800);
eq('insurance couple luxury (250*1.6)', b.lines.insurance.amount, 400);
eq('subtotalHard', b.subtotalHard, 26270);
eq('grandTotal', b.grandTotal, 39000);
eq('range low/high', [b.rangeLow, b.rangeHigh], [36000, 43500]);
eq('flags.careNoted', b.flags.careNoted, true);

console.log('\nScenario C — same dates → error');
const c = computeEstimate({ departDate: '2026-09-12', returnDate: '2026-09-12', travelers: 'solo', destination: { countryCode: 'PT' } }, {});
eq('ok=false', c.ok, false);
eq('error message', c.error, 'Trip length must be at least 1 night.');

console.log('\nScenario D — live flight + hotel data used');
const d = computeEstimate(
  { departDate: '2026-09-12', returnDate: '2026-09-19', flightClass: 'economy', travelers: 'solo', care: 'no', feel: 'comfortable', destination: { countryCode: 'PT' } },
  { flight: { found: true, total: 1500, airline: 'TAP Air Portugal', seats: 2 }, hotel: { found: true, perRoomPerNight: 120, name: 'Hotel Infante Sagres', rating: '4' } }
);
eq('flights live', d.lines.flights.amount, 1500);
eq('flights airline', d.lines.flights.airline, 'TAP Air Portugal');
eq('hotel live (120*2*7)', d.lines.hotel.amount, 1680);
eq('hotel name', d.lines.hotel.name, 'Hotel Infante Sagres');
eq('grandTotal', d.grandTotal, 11000);
eq('flags.livePricingUnavailable false', d.flags.livePricingUnavailable, false);

console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES'} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
