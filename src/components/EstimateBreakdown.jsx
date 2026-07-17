import { Link } from 'react-router-dom';
import { money } from '../lib/pricing.js';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const EST_FLAG = 'Estimated — live pricing unavailable for this route.';

function Line({ label, meta, amount, flag, sub, muted }) {
  return (
    <div className={`line${sub ? ' line--sub' : ''}${muted ? ' line--muted' : ''}`}>
      <span className="line__label">
        {label}
        {meta && <span className="line__meta">{meta}</span>}
        {flag && <span className="line__meta line__flag">{flag}</span>}
      </span>
      <span className="line__amount">{money(amount)}</span>
    </div>
  );
}

export default function EstimateBreakdown({ result, loading }) {
  if (!result || !result.ok) return null;
  const L = result.lines;

  return (
    <div className="breakdown" aria-live="polite">
      {loading && (
        <div className="breakdown__loading">
          <span className="spinner" /> Checking live flight &amp; hotel pricing…
        </div>
      )}

      <div className="breakdown__head">Your Estimate</div>

      {result.flags.destinationEstimated && (
        <div className="care-flag" style={{ marginTop: 0, marginBottom: 18 }}>
          Destination pricing estimated — confirmed on consultation.
        </div>
      )}

      <Line
        label="Flights"
        meta={`${L.flights.airline ? L.flights.airline + ' · ' : ''}${L.flights.cabinLabel} · ${L.flights.seats} seats`}
        amount={L.flights.amount}
        flag={[
          L.flights.estimated ? EST_FLAG : null,
          L.flights.businessFallback ? 'Business class availability confirmed at booking.' : null,
        ].filter(Boolean).join(' ')}
      />
      <Line
        label="Hotel"
        meta={`${L.hotel.name ? L.hotel.name + ' · ' : ''}${L.hotel.starLabel} · ${L.hotel.rooms} rooms · ${L.hotel.nights} nights`}
        amount={L.hotel.amount}
        flag={L.hotel.estimated ? EST_FLAG : ''}
      />
      <Line label="Ground transport" meta={`${L.ground.nights} days · ${cap(L.ground.feel)}`} amount={L.ground.amount} />
      <Line label="Food" meta={`${L.food.nights} days · ${L.food.people} people · ${cap(L.food.feel)}`} amount={L.food.amount} />
      <Line label="Experiences" meta={cap(L.experiences.feel)} amount={L.experiences.amount} />
      <Line label="Travel insurance" amount={L.insurance.amount} />
      <Line label="BOS airport transport" amount={L.bos.amount} />

      <Line label="Subtotal hard costs" amount={result.subtotalHard} sub />
      <Line label="10% buffer" amount={result.buffer} muted />
      <Line
        label="Cedr service fee"
        meta={`${result.nights} days × ${money(result.dayRate)}/day`}
        amount={result.serviceFee}
      />

      <div className="grand">
        <span className="grand__label">Grand total</span>
        <span className="grand__value">{money(result.grandTotal)}</span>
      </div>
      <div className="range">
        Estimated range: <strong>{money(result.rangeLow)} — {money(result.rangeHigh)}</strong>
      </div>

      <p className="fine-print">
        This is an estimate based on current pricing. Final costs are confirmed after your
        consultation and actual bookings. You will receive one flat invoice with no follow-up charges.
      </p>

      {result.flags.careNoted && (
        <div className="care-flag">
          Accessibility requirements noted — your estimate may vary slightly after consultation.
        </div>
      )}

      <div className="breakdown__cta">
        <Link to="/#cta" className="btn btn--navy">Discuss this trip with Christopher</Link>
      </div>
    </div>
  );
}
