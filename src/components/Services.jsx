import { Link } from 'react-router-dom'
import { SERVICES, SITE, WHY_CHOOSE } from '../data/site'
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
}

export default function Services({ standalone = false }) {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section id={standalone ? undefined : 'services'} className={`section services ${standalone ? 'services--page' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">What We Make</p>
            <h2>Custom Rattan Furniture</h2>
            <p>
              From a single accent chair to a full outdoor lounge — hand-woven in our
              Nyeri and Nairobi workshops.
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
                  <p>{service.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="services__cta-band" delay={150}>
          <div className="services__cta-copy">
            <h3>Have a project in mind?</h3>
            <p>Tell us what you need — we will guide you from design to delivery.</p>
          </div>
          <div className="services__cta-btns">
            <Link to="/contact" className="btn btn-outline">
              Get in Touch
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
