import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HOSPITALITY } from '../data/content'
import { SITE } from '../data/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { useApp } from '../context/AppContext'
import { createTradeEnquiry } from '../utils/cms'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

const PROJECT_TYPES = [
  { id: 'hospitality', label: 'Hospitality / hotel' },
  { id: 'restaurant', label: 'Restaurant / café' },
  { id: 'designer', label: 'Interior designer' },
  { id: 'office', label: 'Office / commercial' },
  { id: 'other', label: 'Other trade' },
]

const emptyTrade = {
  name: '',
  company: '',
  phone: '',
  email: '',
  projectType: 'hospitality',
  message: '',
  samplesNote: '',
}

export default function HospitalitySection({ standalone = false }) {
  const meta = usePageMeta('hospitality')
  const { pageContent, user, showToast } = useApp()
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : [HOSPITALITY.intro]
  const cards = c.cards?.length ? c.cards : HOSPITALITY.audiences
  const bullets = c.bullets?.length ? c.bullets : HOSPITALITY.benefits
  const tradeCopy = pageContent?.trade || {}
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(
    'Hello Ellines Rattan Furniture, I would like to enquire about a hospitality / trade project.',
  )}`

  const [form, setForm] = useState(emptyTrade)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleTradeSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    setSubmitting(true)
    try {
      const saved = await createTradeEnquiry({
        ...form,
        userId: user?.id || null,
      })
      setDone(saved)
      setForm(emptyTrade)
      showToast?.('Trade enquiry submitted')
    } catch (err) {
      setError(err.message || 'Could not submit. Try WhatsApp instead.')
    }
    setSubmitting(false)
  }

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Trade & Contract'}</p>
            <h2>{c.sectionHeading || 'Hospitality & Trade'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          {intro.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </Reveal>

        <div className="card-grid card-grid--2">
          {cards.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <article className="card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__media card__media--16x10">
                  <OptimizedImage
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    useThumb
                    thumbWidth={640}
                  />
                </div>
                <div className="card__body">
                  <h3 className="card__title">{item.title}</h3>
                  <p className="card__desc">{item.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__block" delay={100}>
          <h3 className="content-page__subtitle">Why partners choose Ellines</h3>
          <ul className="hospitality-benefits">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="content-page__block" delay={120}>
          <h3 className="content-page__subtitle">For designers &amp; trade</h3>
          <div className="card-grid card-grid--2">
            {(c.tradePerks?.length ? c.tradePerks : HOSPITALITY.tradePerks).map((perk) => (
              <article key={perk.title} className="card">
                <div className="card__body">
                  <h4 className="card__title">{perk.title}</h4>
                  <p className="card__desc">{perk.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-page__block" delay={140}>
          <div className="card" style={{ padding: '1.5rem' }}>
          <h3 className="content-page__subtitle">Trade interest form</h3>
          <p className="visit-form-wrap__hint" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {tradeCopy.formIntro ||
              'Tell us about your project — request sample weaves, drawings, and trade pricing.'}
          </p>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <p>Thanks — we received your trade enquiry (ref {done.id}).</p>
              <div className="content-page__cta-row" style={{ justifyContent: 'center', marginTop: 12 }}>
                <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
                  Follow up on WhatsApp
                </a>
                <button type="button" className="btn btn-outline" onClick={() => setDone(null)}>
                  Submit another
                </button>
              </div>
            </div>
          ) : (
            <form className="visit-form" onSubmit={handleTradeSubmit} noValidate style={{ maxWidth: 640, margin: '0 auto' }}>
              <div className="visit-form__row">
                <label>
                  Name *
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Company / studio
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setField('company', e.target.value)}
                  />
                </label>
              </div>
              <div className="visit-form__row">
                <label>
                  Phone *
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </label>
              </div>
              <label>
                Project type
                <select
                  value={form.projectType}
                  onChange={(e) => setField('projectType', e.target.value)}
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Project brief
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  placeholder="Quantity, timeline, location…"
                />
              </label>
              <label>
                {tradeCopy.sampleNoteLabel || 'Samples / drawings needed'}
                <textarea
                  rows={2}
                  value={form.samplesNote}
                  onChange={(e) => setField('samplesNote', e.target.value)}
                  placeholder={
                    tradeCopy.sampleNotePlaceholder ||
                    'e.g. Weave colour samples, CAD footprints…'
                  }
                />
              </label>
              {error && <p className="visit-form__error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit trade enquiry'}
              </button>
            </form>
          )}
          </div>
        </Reveal>

        <Reveal className="content-page__cta card" delay={150}>
          <p>Share your project brief — we respond fastest on WhatsApp.</p>
          <div className="content-page__cta-row">
            <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
              Trade Enquiry
            </a>
            <Link to="/catalogue" className="btn btn-outline">
              Catalogue
            </Link>
            <Link to="/financing" className="btn btn-outline">
              Financing
            </Link>
            <Link to="/visit" className="btn btn-outline">
              Book a visit
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
