import { Link } from 'react-router-dom'
import { COLLECTIONS } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function CollectionsSection({ standalone = false }) {
  const meta = usePageMeta('collections')
  const c = meta.content || {}
  const cards = c.cards?.length
    ? c.cards
    : COLLECTIONS.map((item) => ({
        title: item.name,
        desc: item.desc,
        image: item.image,
        category: item.category,
      }))

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Browse'}</p>
            <h2>{c.sectionHeading || 'Our Collections'}</h2>
            <p>{c.sectionSub || 'Explore categories — every piece can be customised to your space.'}</p>
          </Reveal>
        )}

        <div className="card-grid card-grid--3">
          {cards.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <Link
                to={`/projects?category=${encodeURIComponent(item.category || item.title)}`}
                className="card card--interactive collections-card"
              >
                <span className="card__shine" aria-hidden="true" />
                <div className="card__media card__media--4x3">
                  {item.category && <span className="card__badge">{item.category}</span>}
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
                  <span className="card__footer">View projects →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__cta card" delay={150}>
          <p>
            Need something outside these collections? We build tailored furniture for any space — bedroom to business.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Start a Custom Order
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
