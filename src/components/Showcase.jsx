import { Link } from 'react-router-dom'
import { FEATURED_SHOWCASE } from '../data/site'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './Showcase.css'

export default function Showcase() {
  return (
    <section className="showcase" aria-label="Featured work">
      <div className="container">
        <Reveal className="showcase__head">
          <p className="section-eyebrow">Signature Pieces</p>
          <h2>From Our Workshop</h2>
          <p className="showcase__sub">
            A preview of what our Nyeri and Nairobi artisans create — tap any piece to explore more.
          </p>
        </Reveal>

        <div className="showcase__grid">
          {FEATURED_SHOWCASE.map((item, i) => (
            <Reveal key={item.src} delay={i * 90}>
              <Link
                to={`/projects?category=${encodeURIComponent(item.category)}`}
                className="showcase__card card card--interactive"
              >
                <span className="card__shine" aria-hidden="true" />
                <div className="showcase__media card__media card__media--4x3">
                  <OptimizedImage
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    useThumb
                    thumbWidth={640}
                  />
                  <span className="showcase__overlay">
                    <span className="showcase__cat">{item.category}</span>
                    <span className="showcase__title">{item.title}</span>
                    <span className="showcase__hint">View in gallery →</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="showcase__cta-wrap" delay={200}>
          <Link to="/projects" className="btn btn-outline showcase__cta">
            View All Projects
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
