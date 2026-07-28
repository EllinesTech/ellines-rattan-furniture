import { Link } from 'react-router-dom'
import { HOSPITALITY } from '../data/content'
import { SITE } from '../data/site'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function HospitalitySection({ standalone = false }) {
  const meta = usePageMeta('hospitality')
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : [HOSPITALITY.intro]
  const cards = c.cards?.length ? c.cards : HOSPITALITY.audiences
  const bullets = c.bullets?.length ? c.bullets : HOSPITALITY.benefits
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(
    'Hello Ellines Rattan Furniture, I would like to enquire about a hospitality / trade project.',
  )}`

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

        <Reveal className="content-page__cta card" delay={150}>
          <p>Share your project brief — we respond fastest on WhatsApp.</p>
          <div className="content-page__cta-row">
            <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
              Trade Enquiry
            </a>
            <Link to="/contact" className="btn btn-outline">
              Contact Page
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
