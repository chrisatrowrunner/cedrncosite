import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import { Rosette, Divider } from '../components/Azulejo.jsx';

export default function Home() {
  return (
    <div id="top">
      <Nav />

      {/* 1. HERO */}
      <header className="hero">
        <Rosette className="hero__art" />
        <div className="hero__inner">
          <div className="eyebrow hero__eyebrow">Premium Travel Companionship</div>
          <h1 className="hero__title">Some trips can't wait <em>any longer.</em></h1>
          <p className="hero__lede">
            Cedr &amp; Co accompanies travelers door to door — from elderly and disabled clients who
            need a trusted hand, to anyone who simply wants the world handled for them. Your
            destination. Your pace. Everything taken care of.
          </p>
          <div className="hero__actions">
            <Link to="/pricing#estimator" className="btn btn--navy">Plan Your Journey</Link>
            <a href="#how" className="link-ghost">Learn how it works →</a>
          </div>
        </div>
      </header>

      {/* 2. DIVIDER */}
      <div className="divider-band" style={{ background: 'var(--parchment)', padding: '8px 0 40px' }}>
        <Divider />
      </div>

      {/* 3. OUR STORY + YOUR COMPANION (merged) */}
      <section id="story" className="story">
        <div className="story__grid">
          <div>
            <div className="eyebrow story__eyebrow">Our Story</div>
            <h2 className="story__h">Born from a trip to Portugal.</h2>
            <p>When Christopher dos Reis flew to Portugal with his grandmother, he understood something most travel companies miss: travelers are not afraid of the world. They are afraid of navigating it alone.</p>
            <p>Raised in Bristol, Rhode Island, in a Portuguese-American family with roots in the Minho, Christopher knows the longing many carry — to return home, to see the places they left behind, to take one last trip before they cannot. Or simply to finally take the trip they have always put off.</p>
            <p>Cedr &amp; Co was built for those people. We know the culture, the people, and the places — and we bring the patience and expertise every traveler deserves.</p>
          </div>
          <div>
            <div className="photo-frame">
              <img src="/assets/img/avo.jpeg" alt="Christopher and his grandmother in Portugal" />
            </div>
            <p className="photo-caption">Christopher and his avó, Portugal.</p>
          </div>
        </div>

        {/* Meet your companion */}
        <div className="companion">
          <div className="companion__media">
            <div className="companion__frame">
              <img src="/assets/img/headshot.jpeg" alt="Christopher dos Reis" />
            </div>
          </div>
          <div>
            <div className="eyebrow companion__eyebrow">Your Companion</div>
            <h2 className="companion__h">Meet Christopher dos Reis.</h2>
            <p>Christopher grew up in Bristol, Rhode Island in a Portuguese-American family with deep roots in the Minho region of Portugal. He graduated from the University of Rhode Island with a degree in Accounting and has traveled to over 10 countries across his lifetime, giving him firsthand knowledge of what it takes to navigate the world confidently and safely.</p>
            <p>For the past year, he has also worked in private aviation security — sharpening the discretion, situational awareness, and calm-under-pressure judgment that keep travelers safe and at ease from the curb to the gate.</p>
            <p>Conversational in Portuguese and deeply rooted in the culture, he founded Cedr &amp; Co to serve anyone who has a trip they keep putting off — whether that is a long-awaited return home, a bucket-list destination, or simply a journey they want handled with care.</p>
            <div className="badges">
              {['Private Aviation Security', 'Conversational Portuguese', 'URI Accounting Graduate', '10+ Countries Visited', 'CPR Certified', 'Bristol, Rhode Island'].map((b) => (
                <span className="badge" key={b}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERVICES */}
      <section id="services" className="services">
        <div className="container">
          <h2 className="services__h">Three ways to travel with complete peace of mind.</h2>
          <div className="cards-3">
            {[
              ['I', 'Companion Trips', 'Full door-to-door travel companionship, internationally. We handle every detail — flights, transfers, hotels, activities — while keeping you or your loved one safe, comfortable, and fully present for every moment.', 'From $650 per day'],
              ['II', 'Airport Escort', 'Professional guidance from curbside through security to the gate and onto the plane. For travelers who can manage independently at their destination but need support at the airport.', 'From $450 flat'],
              ['III', 'Trip Planning', "A fully accessible, personalized itinerary built around the traveler's needs, pace, and preferences — every hotel, flight, and experience booked, confirmed, and explained.", 'From $400 flat'],
            ].map(([num, name, desc, rate]) => (
              <div className="card" key={num}>
                <div className="card__numeral">{num}</div>
                <h3 className="card__name">{name}</h3>
                <p className="card__desc">{desc}</p>
                <div className="card__rate">{rate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="divider-band" style={{ background: 'var(--offwhite)', padding: '8px 0 44px' }}>
        <Divider />
      </div>

      {/* 5. HOW IT WORKS */}
      <section id="how" className="how">
        <div className="container">
          <div className="how__head">
            <h2 className="how__h">Simple from your first call to their safe return home.</h2>
            <p className="italic-note">One price. Everything included. Nothing to think about.</p>
          </div>
          <div className="steps">
            {[
              ['1', 'Tell us about your trip', 'A short conversation about who is traveling, where they want to go, and what matters most to them.'],
              ['2', 'We design the journey', 'A fully personalized itinerary built around the traveler, not a template. Every hotel, flight, restaurant, and experience selected with care.'],
              ['3', 'One price covers everything', "Flights, hotels, all transportation within the destination, meals, experiences, tips, travel insurance, and Christopher's full companionship from your front door to theirs. No invoices. No surprises. No extras."],
              ['4', 'We bring them home', 'Door to door, the entire way. Updates throughout. They return safely with memories that last a lifetime.'],
            ].map(([num, title, body]) => (
              <div className="step" key={num}>
                <div className="step__num">{num}</div>
                <h3 className="step__title">{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
          <div className="callout">
            <p>"Your single invoice covers flights, accommodation, all ground transportation, every meal, curated experiences, travel insurance, and your personal companion — for the entire journey. You will never receive a follow-up bill."</p>
          </div>
          <p className="how__foot">The only thing you need to bring is yourself.</p>
        </div>
      </section>

      {/* 6. PRICING CTA */}
      <section className="pricing-band">
        <div className="pricing-band__inner">
          <span className="eyebrow">One Price, Everything Included</span>
          <h2>Curious what your journey might cost?</h2>
          <p>Build a personalized estimate in a few clicks — a starting point for our conversation, with no obligation.</p>
          <Link to="/pricing#estimator" className="btn btn--navy">View pricing &amp; get an estimate →</Link>
        </div>
      </section>

      {/* 7. DESTINATIONS */}
      <section id="destinations" className="destinations">
        <div className="container">
          <h2 className="destinations__h">From Porto to Tokyo, we know the way.</h2>
          <div className="dest-grid">
            {[
              ['porto', 'Porto, Portugal', 'The city that started it all.'],
              ['rome', 'Rome, Italy', 'Ancient, overwhelming, and unforgettable with the right guide.'],
              ['tokyo', 'Tokyo, Japan', 'A world unlike any other — extraordinary once you know how to move through it.'],
              ['nyc', 'New York City', 'Iconic, busy, and best experienced with someone who knows the way.'],
            ].map(([slug, name, tag]) => (
              <article className="dest-card" key={slug}>
                <img
                  className="dest-card__img"
                  src={`/assets/img/${slug}.jpg`}
                  onError={(e) => { e.currentTarget.src = `/assets/img/${slug}.svg`; }}
                  alt={name}
                  loading="lazy"
                />
                <Rosette className="dest-card__texture" />
                <div className="dest-card__scrim"></div>
                <div className="dest-card__body">
                  <h3 className="dest-card__name">{name}</h3>
                  <p className="dest-card__tag">{tag}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="destinations__foot">
            <a href="#destinations" className="link-gold">View all destinations →</a>
          </div>
        </div>
      </section>

      {/* 8. DIVIDER */}
      <div className="divider-band" style={{ background: 'var(--parchment)', padding: '4px 0 40px' }}>
        <Divider />
      </div>

      {/* 9. TESTIMONIAL */}
      <section className="testimonial">
        <div className="testimonial__inner">
          <span className="eyebrow">From Our Travelers</span>
          <blockquote>"My mother hadn't been back to her village in forty years. Christopher got her there and back safely, and she cried the whole flight home — the good kind."</blockquote>
          <div className="testimonial__attr">— A Family from Fall River, Massachusetts</div>
          <div className="dots">
            <span className="dot dot--active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section id="cta" className="final-cta">
        <Rosette className="final-cta__art" />
        <div className="final-cta__inner">
          <span className="eyebrow">Ready to Begin</span>
          <h2>There's a trip you've been putting off.</h2>
          <p className="final-cta__sub">Tell us where you want to go. We'll handle everything else.</p>
          <Link to="/pricing#estimator" className="btn btn--gold">Start the Conversation</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
