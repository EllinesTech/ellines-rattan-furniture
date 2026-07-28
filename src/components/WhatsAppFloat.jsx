import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE } from '../data/site'
import './WhatsAppFloat.css'

const TABS = [
  { id: 'quote', label: 'Quote' },
  { id: 'call', label: 'Call' },
  { id: 'whatsapp', label: 'WhatsApp' },
]

function QuoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function MinimizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </svg>
  )
}

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('whatsapp')
  const location = useLocation()

  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const selectTab = (id) => {
    setTab(id)
    if (id === 'whatsapp') {
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="contact-float">
      {open && (
        <div className="contact-float__panel" role="dialog" aria-label="Contact Ellines Rattan Furniture">
          <div className="contact-float__head">
            <div className="contact-float__brand">
              <div className="contact-float__avatar">
                <img
                  src="/images/logos/ellines-rattan-logo-transparent.png"
                  alt=""
                  width="40"
                  height="40"
                />
                <span className="contact-float__online" aria-hidden />
              </div>
              <div>
                <p className="contact-float__title">Ellines Rattan</p>
                <p className="contact-float__status">
                  {SITE.hours} · Online
                </p>
              </div>
            </div>
            <button
              type="button"
              className="contact-float__icon-btn"
              aria-label="Minimize contact panel"
              onClick={() => setOpen(false)}
            >
              <MinimizeIcon />
            </button>
          </div>

          <div className="contact-float__tabs" role="tablist" aria-label="Contact channels">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`contact-float__tab${tab === item.id ? ' contact-float__tab--active' : ''}`}
                onClick={() => selectTab(item.id)}
              >
                {item.id === 'quote' && <QuoteIcon />}
                {item.id === 'call' && <PhoneIcon />}
                {item.id === 'whatsapp' && <WhatsAppIcon />}
                {item.label}
              </button>
            ))}
          </div>

          <div className="contact-float__body">
            {tab === 'quote' && (
              <div className="contact-float__pane">
                <p className="contact-float__copy">
                  Build a custom quote for sofas, living sets, cabinets, and outdoor pieces — then send it to our workshop team.
                </p>
                <Link to="/quote" className="contact-float__primary" onClick={() => setOpen(false)}>
                  Start a quote
                </Link>
                <Link to="/contact" className="contact-float__secondary" onClick={() => setOpen(false)}>
                  Or send a message
                </Link>
              </div>
            )}

            {tab === 'call' && (
              <div className="contact-float__pane">
                <p className="contact-float__copy">
                  Speak with our Nyeri or Nairobi workshop. We&apos;re available {SITE.hours}.
                </p>
                <ul className="contact-float__phones">
                  {SITE.phones.map((phone) => (
                    <li key={phone.tel}>
                      <a href={`tel:${phone.tel}`} className="contact-float__phone">
                        <PhoneIcon />
                        <span>{phone.display}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'whatsapp' && (
              <div className="contact-float__pane">
                <p className="contact-float__copy">
                  Chat with us on WhatsApp for the fastest reply — share photos, sizes, and your preferred finish.
                </p>
                <a
                  href={waUrl}
                  className="contact-float__primary contact-float__primary--wa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon size={16} />
                  Continue on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className={`contact-float__launcher${open ? ' contact-float__launcher--open' : ''}`}
        aria-label={open ? 'Close contact panel' : 'Open contact options'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
        <span className="contact-float__launcher-label">{open ? 'Close' : 'Chat with us'}</span>
        {!open && <span className="contact-float__pulse" aria-hidden />}
      </button>
    </div>
  )
}
