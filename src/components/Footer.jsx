import { SITE } from '../data/site'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  const waUrl = `https://wa.me/${SITE.whatsapp.number}`

  return (
    <footer className="footer">
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
              width="64"
              height="64"
            />
            <p className="footer__tagline">{SITE.tagline}</p>
            <p className="footer__desc">
              Handcrafted synthetic rattan furniture — custom sofas, armchairs, cabinets,
              tables, and outdoor sets made in Kenya.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <ul className="footer__links">
              <li><a href="#about">Craftsmanship</a></li>
              <li><a href="#gallery">Projects</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
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
              <li>{SITE.location}</li>
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
