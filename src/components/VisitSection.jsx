import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VISIT_INFO } from '../data/content'
import { SITE } from '../data/site'
import { usePageMeta } from '../hooks/usePageMeta'
import Reveal from './Reveal'
import './ContentPages.css'
import './VisitSection.css'

const PURPOSES = [
  { id: 'showroom', label: 'Nairobi showroom visit' },
  { id: 'consultation', label: 'Paid consultation' },
  { id: 'nyeri', label: 'Nyeri atelier preview' },
  { id: 'site', label: 'Site / space discussion' },
]

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  purpose: 'showroom',
  preferredDate: '',
  preferredTime: '',
  notes: '',
}

export default function VisitSection({ standalone = false }) {
  const meta = usePageMeta('visit')
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : [VISIT_INFO.intro]
  const options = c.cards?.length ? c.cards : VISIT_INFO.options
  const whatToBring = c.whatToBring?.length ? c.whatToBring : VISIT_INFO.whatToBring
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    const purposeLabel = PURPOSES.find((p) => p.id === form.purpose)?.label || form.purpose
    const lines = [
      'Hello Ellines Rattan Furniture — I would like to book a visit / consultation.',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      form.email.trim() ? `Email: ${form.email.trim()}` : null,
      `Purpose: ${purposeLabel}`,
      form.preferredDate ? `Preferred date: ${form.preferredDate}` : null,
      form.preferredTime ? `Preferred time: ${form.preferredTime}` : null,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
    ].filter(Boolean)
    const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Showroom & Consultation'}</p>
            <h2>{c.sectionHeading || 'Visit or Book a Consultation'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          {intro.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </Reveal>

        <div className="card-grid card-grid--3 visit-options">
          {options.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <article className="card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__body">
                  <h3 className="card__title">{item.title}</h3>
                  <p className="card__desc">{item.desc}</p>
                  {(item.detail || item.care) && (
                    <p className="card__footer">{item.detail || item.care}</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="visit-layout">
          <Reveal className="visit-form-wrap card">
            <h3 className="content-page__subtitle visit-form-wrap__title">Request a booking</h3>
            <p className="visit-form-wrap__hint">
              We confirm appointments on WhatsApp — submit to open a pre-filled message.
            </p>
            <form className="visit-form" onSubmit={handleSubmit} noValidate>
              <div className="visit-form__row">
                <label>
                  Name *
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Phone *
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>
              <label>
                Email (optional)
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  autoComplete="email"
                />
              </label>
              <fieldset className="visit-form__purpose">
                <legend>Purpose</legend>
                <div className="visit-form__purpose-grid">
                  {PURPOSES.map((p) => (
                    <label key={p.id} className={form.purpose === p.id ? 'is-active' : ''}>
                      <input
                        type="radio"
                        name="purpose"
                        value={p.id}
                        checked={form.purpose === p.id}
                        onChange={() => setField('purpose', p.id)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="visit-form__row">
                <label>
                  Preferred date
                  <input
                    type="date"
                    value={form.preferredDate}
                    onChange={(e) => setField('preferredDate', e.target.value)}
                  />
                </label>
                <label>
                  Preferred time
                  <input
                    type="text"
                    placeholder="e.g. Morning / 10:00"
                    value={form.preferredTime}
                    onChange={(e) => setField('preferredTime', e.target.value)}
                  />
                </label>
              </div>
              <label>
                Notes
                <textarea
                  rows={3}
                  placeholder="Space type, pieces of interest, or measurements…"
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                />
              </label>
              {error && <p className="visit-form__error">{error}</p>}
              <button type="submit" className="btn btn-primary btn-wa">
                Continue on WhatsApp
              </button>
            </form>
          </Reveal>

          <Reveal className="visit-aside" delay={100}>
            <div className="card visit-aside__card">
              <h3 className="card__title">What to bring</h3>
              <ul className="guide-checklist">
                {whatToBring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card visit-aside__card">
              <h3 className="card__title">Workshops</h3>
              <ul className="visit-workshops">
                {SITE.workshops.map((w) => (
                  <li key={w.city}>
                    <strong>{w.label}</strong>
                    <span>{w.description}</span>
                  </li>
                ))}
              </ul>
              <p className="visit-aside__hours">{SITE.hours}</p>
              <div className="content-page__cta-row">
                <Link to="/guide" className="btn btn-outline">
                  Measurement guide
                </Link>
                <Link to="/services" className="btn btn-outline">
                  Consultation fees
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
