import { NAV_LINKS, SITE } from '../data/site'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="footer__cta">
        <div className="container footer__cta-inner">
          <div className="footer__cta-copy">
            <h2>Ready to transform your space?</h2>
            <p>Custom rattan furniture, woven by hand in Nyeri &amp; Nairobi.</p>
          </div>
          <a href={waUrl} className="btn btn-primary btn-wa footer__cta-btn" target="_blank" rel="noopener noreferrer">
            Start on WhatsApp
          </a>
        </div>
      </div>

      <div className="footer__topband" aria-hidden="true">
        <div className="footer__topband-line" />
        <span className="footer__topband-mark">✦</span>
        <div className="footer__topband-line" />
      </div>

      <div className="container footer__main">
        <div className="footer__grid">
          <div className="footer__brand">
            <img
              src="/images/logos/ellines-rattan-logo-transparent.png"
              alt={SITE.name}
              className="footer__logo"
              width="1024"
              height="1024"
            />
            <p className="footer__tagline">{SITE.tagline}</p>
            <p className="footer__desc">
              Handcrafted synthetic rattan furniture — custom sofas, armchairs, cabinets,
              tables, and outdoor sets from our workshops in Nyeri and Nairobi.
            </p>
          </div>

          <div>
            <h3>Explore</h3>
            <ul className="footer__links">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button type="button" className="footer__nav-link" onClick={() => scrollTo(link.id)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Workshops</h3>
            <ul className="footer__links">
              {SITE.workshops.map((w) => (
                <li key={w.city}>
                  <strong>{w.city}</strong> — {w.description}
                </li>
              ))}
              <li>{SITE.hours}</li>
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul className="footer__links">
              <li>
                <a href={waUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
              {SITE.phones.map((phone) => (
                <li key={phone.tel}>
                  <a href={`tel:${phone.tel}`}>{phone.display}</a>
                </li>
              ))}
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <p>
            Part of{' '}
            <a href="https://tech.ellines.co.ke/" target="_blank" rel="noopener noreferrer">
              Ellines Group
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
