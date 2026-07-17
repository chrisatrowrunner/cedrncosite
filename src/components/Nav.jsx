import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onPricing = pathname === '/pricing';
  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <Link to="/" className="nav__logo" onClick={close}>
        Cedr <span className="amp">&amp;</span> Co
      </Link>
      <button
        className="nav__toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span><span></span><span></span>
      </button>
      <div className={`nav__links${open ? ' is-open' : ''}`}>
        <Link to="/#services" className="nav__link" onClick={close}>Services</Link>
        <Link to="/#destinations" className="nav__link" onClick={close}>Destinations</Link>
        <Link to="/#story" className="nav__link" onClick={close}>Our Story</Link>
        <Link
          to="/pricing"
          className={`nav__link${onPricing ? ' nav__link--active' : ''}`}
          onClick={close}
        >
          Pricing
        </Link>
        <Link to="/#cta" className="nav__cta" onClick={close}>Start the Conversation</Link>
      </div>
    </nav>
  );
}
