import { useEffect, useState } from 'react'
import { NAV_LINKS, SITE } from '../data/site'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <button
          type="button"
          className="nav__brand"
          onClick={() => scrollTo('home')}
          aria-label={`${SITE.name} home`}
        >
          <img
            src="/images/logos/ellines-rattan-logo-transparent.png"
            alt=""
            className="nav__logo"
            width="48"
            height="48"
          />
          <span className="nav__brand-text">
            <span className="nav__brand-name">Ellines</span>
            <span className="nav__brand-sub">Rattan Furniture</span>
          </span>
        </button>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              className="nav__link"
              onClick={() => scrollTo(link.id)}
            >
              {link.label}
            </button>
          ))}
          <a
            href={`https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`}
            className="btn btn-wa nav__cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Us
          </a>
        </nav>

        <button
          type="button"
          className={`nav__toggle ${open ? 'nav__toggle--open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="nav__backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  )
}
