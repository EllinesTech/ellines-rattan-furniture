import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_LINKS, SITE } from '../data/site'
import { useApp } from '../context/AppContext'
import { getPostLoginRoute } from '../utils/roles'
import './Navbar.css'

export default function Navbar() {
  const { quoteCount, user } = useApp()
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

  const closeMenu = () => setOpen(false)

  const accountPath = user ? getPostLoginRoute(user) : '/account/login'
  const accountLabel = user ? 'Account' : 'Sign in'

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" aria-label={`${SITE.name} home`} onClick={closeMenu}>
          <img
            src="/images/logos/ellines-rattan-logo-transparent.png"
            alt=""
            className="nav__logo"
            width="1024"
            height="1024"
          />
          <span className="nav__brand-text">
            <span className="nav__brand-name">Ellines</span>
            <span className="nav__brand-sub">Rattan Furniture</span>
          </span>
        </Link>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `nav__link ${isActive ? 'nav__link--active' : ''}`
              }
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="nav__actions">
            <Link to="/quote" className="nav__quote-link" onClick={closeMenu}>
              Quote
              {quoteCount > 0 && <span className="nav__quote-badge">{quoteCount}</span>}
            </Link>
            <Link to={accountPath} className="nav__account-link" onClick={closeMenu}>
              {accountLabel}
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`}
              className="btn btn-wa nav__cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </nav>

        <div className="nav__mobile-actions">
          <Link to="/quote" className="nav__quote-mobile" onClick={closeMenu} aria-label="Quote">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            {quoteCount > 0 && <span className="nav__quote-badge">{quoteCount}</span>}
          </Link>
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
      </div>

      {open && (
        <button
          type="button"
          className="nav__backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
    </header>
  )
}
