import { useMemo, useState } from 'react';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import { Rosette, Divider } from '../components/Azulejo.jsx';
import CityAutocomplete from '../components/CityAutocomplete.jsx';
import Segmented from '../components/Segmented.jsx';
import EstimateBreakdown from '../components/EstimateBreakdown.jsx';
import { searchFlights, searchHotels } from '../lib/api.js';
import { computeEstimate, counts, duffelCabinClass, starRatingSet, nightsBetween } from '../lib/pricing.js';

const emptyCity = { text: '', code: null, countryCode: null, countryName: '', cityName: '', latitude: null, longitude: null };

const RATE_CARDS = [
  ['I', 'Companion Trips', 'Full door-to-door travel companionship, internationally. Every detail handled, start to finish.', 'From $650 per day'],
  ['II', 'Airport Escort', 'Professional guidance from curbside through security to the gate and onto the plane.', 'From $450 flat'],
  ['III', 'Trip Planning', "A fully accessible, personalized itinerary built around the traveler's needs and pace.", 'From $400 flat'],
];

export default function Pricing() {
  const [departure, setDeparture] = useState(emptyCity);
  const [destination, setDestination] = useState(emptyCity);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [flightClass, setFlightClass] = useState('economy');
  const [travelers, setTravelers] = useState('solo');
  const [care, setCare] = useState('no');
  const [feel, setFeel] = useState('comfortable');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nights = useMemo(() => nightsBetween(departDate, returnDate), [departDate, returnDate]);
  const tripLengthLabel = departDate && returnDate
    ? (nights >= 1
        ? `${nights} ${nights === 1 ? 'night' : 'nights'} · trip length calculated automatically`
        : 'Trip length must be at least 1 night.')
    : 'Select your dates to calculate trip length';

  const canEstimate = departure.text.trim() && destination.text.trim() && departDate && returnDate;

  const onCityInput = (setter) => (text) => setter({ ...emptyCity, text });
  const onCitySelect = (setter) => (loc) =>
    setter({
      text: loc.cityName,
      code: loc.iataCode,
      countryCode: loc.countryCode,
      countryName: loc.countryName,
      cityName: loc.cityName,
      latitude: loc.latitude ?? null,
      longitude: loc.longitude ?? null,
    });

  async function handleEstimate() {
    setError(null);
    if (!departDate || !returnDate) {
      setError('Please select departure and return dates.');
      setResult(null);
      return;
    }
    if (nights < 1) {
      setError('Trip length must be at least 1 night.');
      setResult(null);
      return;
    }

    const inputs = {
      departDate, returnDate, flightClass, travelers, care, feel,
      destination: {
        countryCode: destination.countryCode,
        countryName: destination.countryName,
        cityName: destination.cityName,
        raw: destination.text,
      },
    };

    // Show the estimate immediately with fallback pricing, then refine with live data.
    setResult(computeEstimate(inputs, {}));
    setLoading(true);

    const { seats } = counts(travelers);
    const flightP = departure.code && destination.code
      ? searchFlights({
          origin: departure.code, destination: destination.code,
          departureDate: departDate, returnDate,
          adults: seats, cabin: duffelCabinClass(flightClass),
        })
      : Promise.resolve(null);
    const hotelP = destination.latitude != null && destination.longitude != null
      ? searchHotels({
          latitude: destination.latitude, longitude: destination.longitude,
          checkInDate: departDate, checkOutDate: returnDate,
          ratings: starRatingSet(feel).join(','),
        })
      : Promise.resolve(null);

    const [flight, hotel] = await Promise.all([flightP, hotelP]);
    setResult(computeEstimate(inputs, { flight, hotel }));
    setLoading(false);
  }

  return (
    <div>
      <Nav />

      <header className="pricing-hero">
        <Rosette className="pricing-hero__art" />
        <div className="pricing-hero__inner">
          <div className="eyebrow">Pricing &amp; Estimates</div>
          <h1>One price. <em>Everything included.</em></h1>
          <p>
            A single, transparent invoice covers the entire journey — flights, hotels, ground
            transport, meals, experiences, insurance, and Christopher's full companionship. Build an
            estimate below to start the conversation.
          </p>
        </div>
      </header>

      <div className="divider-band" style={{ background: 'var(--parchment)', padding: '0 0 44px' }}>
        <Divider />
      </div>

      {/* Service rates */}
      <section className="rates">
        <div className="container">
          <h2 className="rates__h">Our services &amp; starting rates.</h2>
          <div className="cards-3">
            {RATE_CARDS.map(([num, name, desc, rate]) => (
              <div className="rate-card" key={num}>
                <div className="rate-card__numeral">{num}</div>
                <h3 className="rate-card__name">{name}</h3>
                <p className="rate-card__desc">{desc}</p>
                <div className="rate-card__rate">{rate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-band" style={{ background: 'var(--offwhite)', padding: '8px 0 44px' }}>
        <Divider />
      </div>

      {/* Estimator */}
      <section id="estimator" className="estimator">
        <div className="estimator__wrap">
          <div className="estimator__head">
            <h2 className="estimator__h">Get an estimate for your trip.</h2>
            <p className="estimator__sub">Not a binding quote — a starting point for our conversation.</p>
          </div>

          <div className="estimator__form">
            {/* Step 1 */}
            <div className="field-group">
              <div className="field-label">01 — Where &amp; when</div>
              <div className="grid-2">
                <CityAutocomplete
                  id="departure" label="Departure city" placeholder="Boston, USA"
                  value={departure.text}
                  onInput={onCityInput(setDeparture)}
                  onSelect={onCitySelect(setDeparture)}
                />
                <CityAutocomplete
                  id="destination" label="Destination" placeholder="Porto, Portugal"
                  value={destination.text}
                  onInput={onCityInput(setDestination)}
                  onSelect={onCitySelect(setDestination)}
                />
                <div className="field">
                  <label>
                    <span className="field__cap">Departure date</span>
                    <input className="input input--date" type="date" value={departDate}
                      onChange={(e) => setDepartDate(e.target.value)} />
                  </label>
                </div>
                <div className="field">
                  <label>
                    <span className="field__cap">Return date</span>
                    <input className="input input--date" type="date" value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)} />
                  </label>
                </div>
              </div>
              <div className="trip-length">{tripLengthLabel}</div>
            </div>

            {/* Step 2 */}
            <div className="field-group">
              <div className="field-label">02 — Flight class</div>
              <Segmented
                ariaLabel="Flight class"
                value={flightClass}
                onChange={setFlightClass}
                options={[
                  { value: 'economy', label: 'Economy' },
                  { value: 'premium', label: 'Premium Economy' },
                  { value: 'business', label: 'Business Class' },
                ]}
              />
            </div>

            {/* Step 3 & 4 */}
            <div className="field-group--split">
              <div>
                <div className="field-label">03 — Travelers</div>
                <Segmented
                  variant="toggle" ariaLabel="Number of travelers"
                  value={travelers} onChange={setTravelers}
                  options={[{ value: 'solo', label: 'Solo' }, { value: 'couple', label: 'Couple' }]}
                />
                <div className="care-note">Christopher always travels too — flights and rooms include him.</div>
              </div>
              <div>
                <div className="field-label">04 — Care needs</div>
                <Segmented
                  variant="toggle" ariaLabel="Care needs"
                  value={care} onChange={setCare}
                  options={[{ value: 'yes', label: 'Yes, assistance' }, { value: 'no', label: 'No, independent' }]}
                />
                <div className="care-note">Does your traveler have mobility limitations or require extra assistance?</div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="field-group--last">
              <div className="field-label">05 — Trip feel</div>
              <Segmented
                ariaLabel="Trip feel"
                value={feel} onChange={setFeel}
                options={[
                  { value: 'budget', label: 'Budget' },
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'luxury', label: 'Luxury' },
                ]}
              />
            </div>
          </div>

          <div className="estimator__actions">
            <button className="btn btn--navy btn--wide" onClick={handleEstimate} disabled={!canEstimate}>
              Reveal your estimate →
            </button>
            {error && <div className="form-error">{error}</div>}
          </div>

          <EstimateBreakdown result={result} loading={loading} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
