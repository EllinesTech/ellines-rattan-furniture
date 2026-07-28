import { Link } from 'react-router-dom'
import { SERVICE_PRICING, SERVICES, SITE, WHY_CHOOSE } from '../data/site'
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

export default function Services({ standalone = false }) {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section id={standalone ? undefined : 'services'} className={`section services ${standalone ? 'services--page' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">What We Offer</p>
            <h2>Custom Rattan Furniture &amp; Care</h2>
            <p>
              New builds, repairs at a reasonable price, and paid furniture consultation —
              from our Nyeri and Nairobi workshops.
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
              <p>{SERVICE_PRICING.note}</p>
            </div>
            <Link to="/shop" className="btn btn-outline services-pricing__shop-link">
              View shop catalogue
            </Link>
          </div>

          <div className="services-pricing__grid">
            {SERVICE_PRICING.tiers.map((tier) => (
              <div key={tier.group} className="services-pricing__tier">
                <h3>{tier.group}</h3>
                <ul className="services-pricing__list">
                  {tier.items.map((item) => (
                    <li key={item.name} className="services-pricing__row">
                      <div className="services-pricing__row-copy">
                        <span className="services-pricing__name">{item.name}</span>
                        {item.detail && <span className="services-pricing__detail">{item.detail}</span>}
                      </div>
                      <span className="services-pricing__price">{formatTierPrice(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="services-pricing__footnote">{SERVICE_PRICING.deliveryNote}</p>
        </Reveal>

        <div className="services__grid">
          {SERVICES.map((service, i) => (
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
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="services__cta-band" delay={150}>
          <div className="services__cta-copy">
            <h3>Need an exact quote?</h3>
            <p>Share photos, dimensions, or a sketch — we will confirm pricing before any work begins.</p>
          </div>
          <div className="services__cta-btns">
            <Link to="/quote" className="btn btn-outline">
              Build a quote
            </Link>
            <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
              WhatsApp Quote
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
