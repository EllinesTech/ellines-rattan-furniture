import { Link } from 'react-router-dom'
import { MEASUREMENT_GUIDE } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import Reveal from './Reveal'
import './ContentPages.css'

export default function MeasureGuideSection({ standalone = false }) {
  const meta = usePageMeta('guide')
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : [MEASUREMENT_GUIDE.intro]
  const tools = c.tools?.length ? c.tools : MEASUREMENT_GUIDE.tools
  const steps = c.cards?.length ? c.cards : MEASUREMENT_GUIDE.steps
  const tips = c.tips?.length ? c.tips : MEASUREMENT_GUIDE.tips
  const ctaNote = c.ctaNote || MEASUREMENT_GUIDE.ctaNote

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Plan Your Build'}</p>
            <h2>{c.sectionHeading || 'Measurement & Space Guide'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          {intro.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </Reveal>

        <Reveal className="content-page__block">
          <h3 className="content-page__subtitle">What you need</h3>
          <ul className="guide-tools">
            {tools.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="content-page__block" delay={60}>
          <h3 className="content-page__subtitle">Four steps to measure</h3>
          <div className="card-grid card-grid--2">
            {steps.map((step, i) => (
              <article key={step.title} className="card card--interactive">
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

        <Reveal className="content-page__block" delay={100}>
          <h3 className="content-page__subtitle">By furniture type</h3>
          <div className="card-grid card-grid--2">
            {tips.map((group) => (
              <article key={group.title} className="card">
                <div className="card__body">
                  <h4 className="card__title">{group.title}</h4>
                  <ul className="guide-checklist">
                    {(group.items || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-page__cta card" delay={140}>
          <p>{ctaNote}</p>
          <div className="content-page__cta-row">
            <Link to="/visit" className="btn btn-primary">
              Book a visit
            </Link>
            <Link to="/quote" className="btn btn-outline">
              Request a quote
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
