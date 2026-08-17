import { Link } from 'react-router-dom';
import { money } from '../lib/pricing.js';

export default function EstimateBreakdown({ result, loading }) {
  if (!result || !result.ok) return null;

  return (
    <div className="breakdown breakdown--total" aria-live="polite">
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

      <div className="grand grand--solo">
        <span className="grand__label">Estimated total</span>
        <span className="grand__value">{money(result.grandTotal)}</span>
        <span className="grand__meta">
          {result.nights} {result.nights === 1 ? 'night' : 'nights'} · all-inclusive, one flat invoice
        </span>
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
