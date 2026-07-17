import { Link } from 'react-router-dom';
import { Divider } from './Azulejo.jsx';

export default function Footer() {
  return (
    <>
      <div className="footer-divider">
        <div className="divider-band"><Divider /></div>
      </div>
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            Cedr <span className="amp">&amp;</span> Co · Bristol, Rhode Island
          </div>
          <div className="footer__links">
            <Link to="/#services" className="footer__link">Services</Link>
            <Link to="/#destinations" className="footer__link">Destinations</Link>
            <Link to="/pricing" className="footer__link">Pricing</Link>
            <Link to="/#cta" className="footer__link">Contact</Link>
          </div>
          <div className="footer__copy">© 2026 Cedr &amp; Co. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
