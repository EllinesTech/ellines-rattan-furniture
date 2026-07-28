import { Link } from 'react-router-dom'
import { DELIVERY_INFO, LEAD_TIMES } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import Reveal from './Reveal'
import './ContentPages.css'

export default function DeliverySection({ standalone = false }) {
  const meta = usePageMeta('delivery')
  const c = meta.content || {}
  const steps = c.cards?.length ? c.cards : DELIVERY_INFO.steps
  const warranty = c.warranty?.length ? c.warranty : DELIVERY_INFO.warranty
  const leadTimes = c.leadTimes?.length ? c.leadTimes : LEAD_TIMES

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Peace of Mind'}</p>
            <h2>{c.sectionHeading || 'Delivery & Warranty'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__block">
          <h3 className="content-page__subtitle">How delivery works</h3>
          <div className="card-grid card-grid--3">
            {steps.map((step, i) => (
              <article key={step.title} className="card card--interactive delivery-step">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__body">
                  <span className="delivery-step__num">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="card__title">{step.title}</h4>
                  <p className="card__desc">{step.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-page__block" delay={80}>
          <h3 className="content-page__subtitle">Typical lead times</h3>
          <p className="content-page__intro content-page__intro--flush">
            Timelines are guides — your quote confirms a build window based on complexity and workshop schedule.
          </p>
          <div className="card-grid card-grid--3">
            {leadTimes.map((item) => (
              <article key={item.title} className="card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__body">
                  <h4 className="card__title">{item.title}</h4>
                  <p className="delivery-lead__range">{item.range}</p>
                  <p className="card__desc">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-page__block" delay={100}>
          <h3 className="content-page__subtitle">Warranty &amp; aftercare</h3>
          <div className="card-grid card-grid--3">
            {warranty.map((item) => (
              <article key={item.title} className="card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__body">
                  <h4 className="card__title">{item.title}</h4>
                  <p className="card__desc">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-page__cta card" delay={150}>
          <p>Questions about delivery to your area or warranty coverage?</p>
          <div className="content-page__cta-row">
            <Link to="/contact" className="btn btn-primary">
              Ask our team
            </Link>
            <Link to="/materials" className="btn btn-outline">
              Care guide
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
