import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SERVICE_PRICING, SERVICES, SITE, WHY_CHOOSE, BUDGET_TIERS, BUDGET_NOTE } from '../data/site'
import { formatKes } from '../utils/auth'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './Services.css'

const ICONS = {
  sofa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4M4 12v4h16v-4M4 12H2v2a2 2 0 002 2h16a2 2 0 002-2v-2h-2" />
    </svg>
  ),
  chair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M7 11V7a2 2 0 012-2h6a2 2 0 012 2v4M5 11h14v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5z" />
    </svg>
  ),
  cabinet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18M8 8h.01M16 8h.01M8 16h.01M16 16h.01" />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 10h16M6 10V6h12v4M8 10v8M16 10v8" />
    </svg>
  ),
  outdoor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  craft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  repair: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  consult: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20v-1a5 5 0 015-5h4a5 5 0 015 5v1" />
      <path d="M18 4l2 2-2 2M6 4L4 6l2 2" />
    </svg>
  ),
}

const CUSTOM_SERVICE_STUB = {
  title: 'Custom service',
  icon: 'craft',
  image: '/images/projects/project-craftsmanship-weaving.jpg',
  pricing: { type: 'quote' },
  description: 'Tell us what you need and our workshop will respond with options.',
}

function formatServicePrice(pricing) {
  if (!pricing) return null
  if (pricing.type === 'quote') return 'Price on request'
  if (pricing.type === 'fee') return formatKes(pricing.amount)
  if (pricing.type === 'from') return `From ${formatKes(pricing.amount)}`
  return formatKes(pricing.amount)
}

function formatTierPrice(item) {
  if (item.type === 'quote' || item.price == null) return 'Quote on request'
  if (item.type === 'fee') return formatKes(item.price)
  return `From ${formatKes(item.price)}`
}

function ServiceRequestModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please describe the service you need.')
      return
    }
    onSubmit({ title: title.trim(), details: details.trim() })
  }

  return (
    <div className="services-modal" role="dialog" aria-modal="true" aria-labelledby="services-modal-title">
      <button type="button" className="services-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="services-modal__panel card">
        <div className="services-modal__head">
          <h2 id="services-modal-title">Custom service request</h2>
          <button type="button" className="services-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="services-modal__intro">
          Describe what you need — repairs, a one-off build, consultation, or anything not listed.
          We welcome all budgets.
        </p>
        {error && <div className="services-modal__error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="custom-service-title">What service do you need? *</label>
            <input
              id="custom-service-title"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Re-weave patio chairs, custom bar stools…"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="custom-service-details">Additional details</label>
            <textarea
              id="custom-service-details"
              className="field"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Dimensions, photos you can share, timeline, budget…"
            />
          </div>
          <div className="services-modal__actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Continue to request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Services({ standalone = false }) {
  const { siteContent, addServiceRequest, showToast, quoteCount } = useApp()
  const navigate = useNavigate()
  const [customOpen, setCustomOpen] = useState(false)
  const [requestedId, setRequestedId] = useState(null)

  const services = siteContent?.services || SERVICES
  const servicePricing = siteContent?.servicePricing || SERVICE_PRICING
  const budgetTiers = siteContent?.budgetTiers || BUDGET_TIERS
  const budgetNote = siteContent?.budgetNote || BUDGET_NOTE
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  const goToServiceQuote = (service, options = {}) => {
    addServiceRequest(service, options)
    const label = options.customTitle || options.pricingItemName || service.title
    setRequestedId(service.title)
    setTimeout(() => setRequestedId(null), 2000)
    showToast(`“${label}” added to your request`, {
      actionHref: '/quote',
      actionLabel: `Continue (${quoteCount + 1})`,
    })
    navigate('/quote', { state: { requestType: 'service_request' } })
  }

  const handlePricingItemRequest = (item, tierGroup) => {
    const stub = {
      title: item.name,
      icon: 'craft',
      pricing: {
        type: item.type === 'quote' ? 'quote' : item.type,
        amount: item.price,
      },
      description: item.detail || tierGroup,
    }
    goToServiceQuote(stub, { pricingItemName: item.name })
  }

  const handleCustomSubmit = ({ title, details }) => {
    addServiceRequest(CUSTOM_SERVICE_STUB, { customTitle: title, customDescription: details })
    setCustomOpen(false)
    showToast('Custom service added — complete your details', {
      actionHref: '/quote',
      actionLabel: 'Continue',
    })
    navigate('/quote', { state: { requestType: 'service_request' } })
  }

  return (
    <section id={standalone ? undefined : 'services'} className={`section services ${standalone ? 'services--page' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">What We Offer</p>
            <h2>Custom Rattan Furniture &amp; Care</h2>
            <p>
              New builds, repairs at a reasonable price, and paid furniture consultation —
              from our Nyeri and Nairobi workshops. Tap any service to request it.
            </p>
          </Reveal>
        )}

        <div className="services__why">
          {WHY_CHOOSE.map((item, i) => (
            <Reveal key={item.title} className="services__why-item" delay={i * 60}>
              <strong>{item.title}</strong>
              <span>{item.desc}</span>
            </Reveal>
          ))}
        </div>

        <Reveal className="services-pricing card" delay={80}>
          <div className="services-pricing__head">
            <div>
              <p className="section-eyebrow">Transparent pricing</p>
              <h2>Service pricing guide</h2>
              <p>{servicePricing.note}</p>
            </div>
            <Link to="/shop" className="btn btn-outline services-pricing__shop-link">
              View shop catalogue
            </Link>
          </div>

          <div className="services-pricing__grid">
            {servicePricing.tiers.map((tier) => (
              <div key={tier.group} className="services-pricing__tier">
                <h3>{tier.group}</h3>
                <ul className="services-pricing__list">
                  {tier.items.map((item) => (
                    <li key={item.name} className="services-pricing__row">
                      <div className="services-pricing__row-copy">
                        <span className="services-pricing__name">{item.name}</span>
                        {item.detail && <span className="services-pricing__detail">{item.detail}</span>}
                      </div>
                      <div className="services-pricing__row-actions">
                        <span className="services-pricing__price">{formatTierPrice(item)}</span>
                        <button
                          type="button"
                          className="services-pricing__request-btn"
                          onClick={() => handlePricingItemRequest(item, tier.group)}
                        >
                          Request
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="services-pricing__footnote">{servicePricing.deliveryNote}</p>
        </Reveal>

        <Reveal className="services-budget card" delay={100}>
          <div className="services-budget__head">
            <p className="section-eyebrow">For every budget</p>
            <h2>Custom budget options</h2>
            <p>{budgetNote}</p>
          </div>
          <div className="services-budget__grid">
            {budgetTiers.map((tier) => (
              <div key={tier.id} className="services-budget__tier">
                <strong>{tier.label}</strong>
                <span className="services-budget__range">{tier.range}</span>
                <p>{tier.note}</p>
              </div>
            ))}
          </div>
          <Link to="/quote" className="btn btn-primary services-budget__cta">
            Request a budget-friendly quote
          </Link>
        </Reveal>

        <Reveal className="services__section-head" delay={60}>
          <h2>Our services</h2>
          <p>Press any service below to add it to your request, or describe a custom need.</p>
        </Reveal>

        <div className="services__grid">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 70}>
              <article className="services__card card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                {service.image && (
                  <div className="services__media card__media card__media--16x10">
                    <OptimizedImage src={service.image} alt={service.title} loading="lazy" useThumb thumbWidth={640} />
                    <span className="services__index">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                )}
                <div className="services__body">
                  <div className="services__icon">{ICONS[service.icon]}</div>
                  <h3>{service.title}</h3>
                  {service.pricing && (
                    <p className="services__price">{formatServicePrice(service.pricing)}</p>
                  )}
                  <p>{service.description}</p>
                  {service.pricing?.note && (
                    <p className="services__price-note">{service.pricing.note}</p>
                  )}
                  <button
                    type="button"
                    className={`btn btn-primary services__request-btn ${requestedId === service.title ? 'services__request-btn--done' : ''}`}
                    onClick={() => goToServiceQuote(service)}
                  >
                    {requestedId === service.title ? 'Added — opening quote…' : 'Request this service'}
                  </button>
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal delay={services.length * 70}>
            <article className="services__card services__card--custom card card--interactive">
              <div className="services__custom-inner">
                <div className="services__icon">{ICONS.craft}</div>
                <h3>Custom service request</h3>
                <p>
                  Need something not listed? Repairs, unusual sizes, hospitality projects,
                  or a mix of services — tell us what you have in mind.
                </p>
                <button
                  type="button"
                  className="btn btn-outline services__request-btn"
                  onClick={() => setCustomOpen(true)}
                >
                  Describe your need
                </button>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal className="services__cta-band" delay={150}>
          <div className="services__cta-copy">
            <h3>Need an exact quote?</h3>
            <p>Share photos, dimensions, or a sketch — we will confirm pricing before any work begins.</p>
          </div>
          <div className="services__cta-btns">
            <button type="button" className="btn btn-outline" onClick={() => setCustomOpen(true)}>
              Custom service
            </button>
            <Link to="/quote" className="btn btn-outline">
              View quote builder
            </Link>
            <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
              WhatsApp Quote
            </a>
          </div>
        </Reveal>
      </div>

      {customOpen && (
        <ServiceRequestModal
          onClose={() => setCustomOpen(false)}
          onSubmit={handleCustomSubmit}
        />
      )}
    </section>
  )
}
