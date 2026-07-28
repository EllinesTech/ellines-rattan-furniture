import { Link } from 'react-router-dom'
import { CARE_GUIDE, MATERIALS } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function MaterialsSection({ standalone = false }) {
  const meta = usePageMeta('materials')
  const c = meta.content || {}
  const cards = c.cards?.length ? c.cards : MATERIALS
  const why = c.whySynthetic || CARE_GUIDE.whySynthetic
  const routines = c.routines?.length ? c.routines : CARE_GUIDE.routines
  const avoid = c.avoid?.length ? c.avoid : CARE_GUIDE.avoid

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Quality'}</p>
            <h2>{c.sectionHeading || 'Materials & Care'}</h2>
            <p>{c.sectionSub || 'Premium materials chosen for beauty, durability, and Kenyan climates.'}</p>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          <p>
            Every Ellines piece is woven in premium synthetic rattan. Choose metal, aluminium, wood, or powder-coated
            steel frames — prices vary by material and finish. Tailored furniture for any space, from bedroom to business.
          </p>
        </Reveal>

        <Reveal className="content-page__block materials-why">
          <h3 className="content-page__subtitle">{why.heading}</h3>
          <p className="materials-why__intro">{why.intro}</p>
          <div className="card-grid card-grid--2">
            {(why.points || []).map((point) => (
              <article key={point.title} className="card">
                <div className="card__body">
                  <h4 className="card__title">{point.title}</h4>
                  <p className="card__desc">{point.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <div className="card-grid card-grid--2">
          {cards.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <article className="card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__media card__media--16x10">
                  <span className="card__badge">Material</span>
                  <OptimizedImage src={item.image} alt={item.title} loading="lazy" useThumb thumbWidth={640} />
                </div>
                <div className="card__body">
                  <h3 className="card__title">{item.title}</h3>
                  <p className="card__desc">{item.desc}</p>
                  {item.care && <p className="card__footer">Care: {item.care}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__block" delay={80}>
          <h3 className="content-page__subtitle">Care & maintenance</h3>
          <div className="card-grid card-grid--2">
            {routines.map((item) => (
              <article key={item.title} className="card">
                <div className="card__body">
                  <h4 className="card__title">{item.title}</h4>
                  <p className="card__desc">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="content-page__block" delay={120}>
          <h3 className="content-page__subtitle">Please avoid</h3>
          <ul className="guide-tools materials-avoid">
            {avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="content-page__cta card" delay={150}>
          <p>Questions about weave, frames, or outdoor suitability?</p>
          <div className="content-page__cta-row">
            <Link to="/visit" className="btn btn-primary">
              See samples in person
            </Link>
            <Link to="/faq" className="btn btn-outline">
              Read FAQ
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
