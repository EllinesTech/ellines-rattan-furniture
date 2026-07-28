import { MATERIALS } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function MaterialsSection({ standalone = false }) {
  const meta = usePageMeta('materials')
  const c = meta.content || {}
  const cards = c.cards?.length ? c.cards : MATERIALS

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
      </div>
    </section>
  )
}
