import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VISIT_INFO } from '../data/content'
import { SITE } from '../data/site'
import { VISIT_TIME_SLOTS } from '../data/seedPageContent'
import { usePageMeta } from '../hooks/usePageMeta'
import { useApp } from '../context/AppContext'
import { createVisitBooking } from '../utils/cms'
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
  const { pageContent, user, showToast, firebaseReady } = useApp()
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : [VISIT_INFO.intro]
  const options = c.cards?.length ? c.cards : VISIT_INFO.options
  const whatToBring = c.whatToBring?.length ? c.whatToBring : VISIT_INFO.whatToBring
  const calendlyUrl = (pageContent?.calendlyUrl || '').trim()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const buildWaLines = () => {
    const purposeLabel = PURPOSES.find((p) => p.id === form.purpose)?.label || form.purpose
    return [
      'Hello Ellines Rattan Furniture — I would like to book a visit / consultation.',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      form.email.trim() ? `Email: ${form.email.trim()}` : null,
      `Purpose: ${purposeLabel}`,
      form.preferredDate ? `Preferred date: ${form.preferredDate}` : null,
      form.preferredTime ? `Preferred time: ${form.preferredTime}` : null,
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
      submitted?.id ? `Booking ref: ${submitted.id}` : null,
    ].filter(Boolean)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    if (!form.preferredDate) {
      setError('Please choose a preferred date.')
      return
    }
    setSubmitting(true)
    try {
      const saved = await createVisitBooking({
        ...form,
        userId: user?.id || null,
      })
      setSubmitted(saved)
      showToast?.('Booking request saved — confirm on WhatsApp if you like')
      setForm(emptyForm)
    } catch (err) {
      setError(err.message || 'Could not save booking. Try WhatsApp instead.')
    }
    setSubmitting(false)
  }

  const openWhatsApp = () => {
    const lines = submitted
      ? [
          'Hello Ellines Rattan Furniture — I just submitted a visit booking on the website.',
          `Name: ${submitted.name}`,
          `Phone: ${submitted.phone}`,
          submitted.preferredDate ? `Preferred: ${submitted.preferredDate} ${submitted.preferredTime || ''}`.trim() : null,
          `Ref: ${submitted.id}`,
        ].filter(Boolean)
      : buildWaLines()
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

        {calendlyUrl && (
          <Reveal className="visit-calendly card" delay={30}>
            <h3 className="content-page__subtitle visit-form-wrap__title">Book on calendar</h3>
            <p className="visit-form-wrap__hint">
              Prefer a live calendar link? Open our booking page, or use the form below to request a slot.
            </p>
            <a href={calendlyUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Open calendar booking
            </a>
          </Reveal>
        )}

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
            {submitted ? (
              <div className="visit-success">
                <h3 className="content-page__subtitle visit-form-wrap__title">Request received</h3>
                <p className="visit-form-wrap__hint">
                  We saved your preferred slot{firebaseReady ? ' to our workshop inbox' : ''}.
                  Reference <strong>{submitted.id}</strong>. Confirm on WhatsApp for the fastest reply.
                </p>
                <div className="content-page__cta-row">
                  <button type="button" className="btn btn-primary btn-wa" onClick={openWhatsApp}>
                    Confirm on WhatsApp
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setSubmitted(null)}>
                    Book another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="content-page__subtitle visit-form-wrap__title">Request a booking</h3>
                <p className="visit-form-wrap__hint">
                  Choose a date and time preference. We confirm appointments — WhatsApp is still available as backup.
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
                      Preferred date *
                      <input
                        type="date"
                        value={form.preferredDate}
                        onChange={(e) => setField('preferredDate', e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Preferred time
                      <select
                        value={form.preferredTime}
                        onChange={(e) => setField('preferredTime', e.target.value)}
                      >
                        <option value="">Flexible / morning</option>
                        {VISIT_TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
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
                  <div className="content-page__cta-row">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Saving…' : 'Submit booking request'}
                    </button>
                    <button type="button" className="btn btn-outline btn-wa" onClick={openWhatsApp}>
                      WhatsApp instead
                    </button>
                  </div>
                </form>
              </>
            )}
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
