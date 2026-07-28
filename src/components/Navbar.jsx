import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ABOUT_DROPDOWN, NAV_LINKS, SITE } from '../data/site'
import { useApp } from '../context/AppContext'
import { getPostLoginRoute } from '../utils/roles'
import './Navbar.css'

function MenuIcon({ open }) {
  if (open) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    )
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={`nav__chevron${open ? ' nav__chevron--open' : ''}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function isAboutActive(pathname) {
  return pathname === ABOUT_DROPDOWN.path || pathname.startsWith(`${ABOUT_DROPDOWN.path}/`)
}

function NavLinksBeforeAbout() {
  return NAV_LINKS.filter((link) => link.path !== '/contact').slice(0, 2)
}

function NavLinksAfterAbout() {
  return NAV_LINKS.filter((link) => link.path !== '/contact').slice(2)
}

function AboutDropdown({ pathname, onNavigate }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const active = isAboutActive(pathname)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div
      ref={wrapRef}
      className={`nav__dropdown${open ? ' nav__dropdown--open' : ''}${active ? ' nav__dropdown--active' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`nav__link nav__link--dropdown${active ? ' nav__link--active' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        {ABOUT_DROPDOWN.label}
        <ChevronIcon open={open} />
      </button>
      <div className="nav__dropdown-menu" role="menu">
        <Link
          to={ABOUT_DROPDOWN.path}
          className={`nav__dropdown-item${pathname === ABOUT_DROPDOWN.path ? ' nav__dropdown-item--active' : ''}`}
          role="menuitem"
          onClick={onNavigate}
        >
          Our Story
        </Link>
        {ABOUT_DROPDOWN.items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav__dropdown-item${pathname === item.path ? ' nav__dropdown-item--active' : ''}`}
            role="menuitem"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Navbar() {
  const { quoteCount, user } = useApp()
  const [open, setOpen] = useState(false)
  const [aboutMobileOpen, setAboutMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    setAboutMobileOpen(false)
  }, [location.pathname])

  const closeMenu = () => setOpen(false)

  const accountPath = user ? getPostLoginRoute(user) : '/account/login'
  const accountLabel = user ? 'Account' : 'Sign in'
  const whatsappHref = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`
  const aboutActive = isAboutActive(location.pathname)

  return (
    <header className="nav">
      <div className="nav__accent-line" aria-hidden />

      <div className="container nav__inner">
        <Link to="/" className="nav__brand" aria-label={`${SITE.name} home`} onClick={closeMenu}>
          <img
            src="/images/logos/ellines-rattan-logo-transparent.png"
            alt=""
            className="nav__logo"
            width="48"
            height="48"
            decoding="async"
          />
          <span className="nav__brand-text">
            <span className="nav__brand-name">Ellines</span>
            <span className="nav__brand-sub">Rattan Furniture</span>
          </span>
        </Link>

        <nav className="nav__menu" aria-label="Main navigation">
          {NavLinksBeforeAbout().map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <AboutDropdown pathname={location.pathname} onNavigate={closeMenu} />
          {NavLinksAfterAbout().map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          <Link to="/quote" className="nav__action-link nav__action-link--quote">
            Quote
            {quoteCount > 0 && <span className="nav__quote-badge">{quoteCount}</span>}
          </Link>
          <Link to={accountPath} className="nav__action-link">
            {accountLabel}
          </Link>
          <a
            href={whatsappHref}
            className="nav__cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
            <ArrowIcon />
          </a>
        </div>

        <div className="nav__mobile-bar">
          <Link to="/quote" className="nav__mobile-quote" onClick={closeMenu} aria-label="Quote">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            {quoteCount > 0 && <span className="nav__quote-badge">{quoteCount}</span>}
          </Link>
          <button
            type="button"
            className="nav__toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav__mobile-panel">
          <nav className="container nav__mobile-nav" aria-label="Mobile navigation">
            {NavLinksBeforeAbout().map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `nav__mobile-link${isActive ? ' nav__mobile-link--active' : ''}`
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}

            <div className={`nav__mobile-group${aboutMobileOpen ? ' nav__mobile-group--open' : ''}`}>
              <button
                type="button"
                className={`nav__mobile-link nav__mobile-link--toggle${aboutActive ? ' nav__mobile-link--active' : ''}`}
                aria-expanded={aboutMobileOpen}
                onClick={() => setAboutMobileOpen((v) => !v)}
              >
                {ABOUT_DROPDOWN.label}
                <ChevronIcon open={aboutMobileOpen} />
              </button>
              {aboutMobileOpen && (
                <div className="nav__mobile-sub">
                  <Link
                    to={ABOUT_DROPDOWN.path}
                    className={`nav__mobile-sublink${location.pathname === ABOUT_DROPDOWN.path ? ' nav__mobile-sublink--active' : ''}`}
                    onClick={closeMenu}
                  >
                    Our Story
                  </Link>
                  {ABOUT_DROPDOWN.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav__mobile-sublink${location.pathname === item.path ? ' nav__mobile-sublink--active' : ''}`}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NavLinksAfterAbout().map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `nav__mobile-link${isActive ? ' nav__mobile-link--active' : ''}`
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="nav__mobile-actions">
              <Link to="/quote" className="nav__mobile-action" onClick={closeMenu}>
                Quote
                {quoteCount > 0 && <span className="nav__quote-badge">{quoteCount}</span>}
              </Link>
              <Link to={accountPath} className="nav__mobile-action" onClick={closeMenu}>
                {accountLabel}
              </Link>
              <a
                href={whatsappHref}
                className="nav__mobile-cta"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                WhatsApp
                <ArrowIcon />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
