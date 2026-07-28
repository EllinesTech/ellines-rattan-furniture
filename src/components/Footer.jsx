import { Link } from 'react-router-dom'
import { FOOTER_LINKS, LEGAL_LINKS } from '../data/content'
import { openCookieSettings } from './CookieConsent'
import { NAV_LINKS, SITE } from '../data/site'
import './Footer.css'

const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9c0-.6.4-1 1-1z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.7 2.7 0 00-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 00-1.9 1.9A28 28 0 002 12a28 28 0 00.4 4.8 2.7 2.7 0 001.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 001.9-1.9A28 28 0 0022 12a28 28 0 00-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.5 9.5H3.7V20h2.8V9.5zM5.1 4A1.6 1.6 0 105.1 7.2 1.6 1.6 0 005.1 4zM20.3 20h-2.8v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20H11V9.5h2.7v1.4h.1a2.9 2.9 0 012.6-1.4c2.8 0 3.9 1.8 3.9 4.2V20z" />
    </svg>
  ),
}

export default function Footer() {
  const year = new Date().getFullYear()
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <footer className="footer">
      <div className="footer__cta">
        <div className="container footer__cta-inner">
          <div className="footer__cta-copy">
            <h2>Ready to transform your space?</h2>
            <p>Custom rattan furniture, woven by hand in Nyeri &amp; Nairobi.</p>
          </div>
          <Link to="/contact" className="btn btn-primary footer__cta-btn">
            Get in Touch
          </Link>
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
              loading="lazy"
              decoding="async"
            />
            <p className="footer__tagline">{SITE.tagline}</p>
            <p className="footer__desc">
              Handcrafted synthetic rattan furniture — custom sofas, armchairs, cabinets,
              tables, and outdoor sets from our workshops in Nyeri and Nairobi. Part of
              Ellines Group.
            </p>
            <div className="footer__social" aria-label="Ellines Rattan Furniture on social media">
              {SITE.social.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="footer__social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.label} ${item.handle}`}
                  title={`${item.label} · ${item.handle}`}
                >
                  {SOCIAL_ICONS[item.id]}
                </a>
              ))}
              <a
                href={waUrl}
                className="footer__social-link footer__social-link--wa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a9.9 9.9 0 00-8.5 14.9L2 22l5.3-1.4A9.9 9.9 0 1012 2zm5.8 14.1c-.2.7-1.3 1.3-2.1 1.4-.6.1-1.3.2-3.8-.8-3.2-1.3-5.2-4.5-5.4-4.7-.2-.2-1.5-2-1.5-3.8s1-2.7 1.3-3.1c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.2.7.8 2.4.9 2.6.1.2.1.4 0 .6-.1.2-.2.4-.3.5-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.3 2.5 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-.1.2-.3.5-.3.8-.2.3.1 2 .9 2.3 1.1.3.2.5.3.6.4.1.2.1.7-.1 1.4z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3>Explore</h3>
            <ul className="footer__links">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__nav-link">{link.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/hospitality" className="footer__nav-link">Hospitality &amp; Trade</Link>
              </li>
              <li>
                <Link to="/about" className="footer__nav-link">Our Story</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3>Learn More</h3>
            <ul className="footer__links">
              {FOOTER_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__nav-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul className="footer__links">
              {SITE.workshops.map((w) => (
                <li key={w.city}>
                  <strong>{w.city}</strong> — {w.description}
                </li>
              ))}
              <li>{SITE.hours}</li>
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
          <p className="footer__legal">
            {LEGAL_LINKS.map((link, i) => (
              <span key={link.path}>
                {i > 0 && ' · '}
                <Link to={link.path}>{link.label}</Link>
              </span>
            ))}
            {' · '}
            <button type="button" className="footer__cookie-btn" onClick={openCookieSettings}>
              Cookie settings
            </button>
            {' · '}
            <a href="https://tech.ellines.co.ke/" target="_blank" rel="noopener noreferrer">
              Ellines Tech
            </a>
            {' · '}
            <a href="https://haven.ellines.co.ke/" target="_blank" rel="noopener noreferrer">
              Ellines Haven
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
