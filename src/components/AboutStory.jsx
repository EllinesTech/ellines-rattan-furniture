import { Link } from 'react-router-dom'
import { ABOUT_STORY } from '../data/content'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function AboutStory({ standalone = false }) {
  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">Our Story</p>
            <h2>The Ellines Journey</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          {ABOUT_STORY.intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </Reveal>

        <div className="card-grid card-grid--3">
          {ABOUT_STORY.values.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <article className="card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__media card__media--4x3">
                  <OptimizedImage src={item.image} alt={item.title} loading="lazy" useThumb thumbWidth={640} />
                </div>
                <div className="card__body">
                  <h3 className="card__title">{item.title}</h3>
                  <p className="card__desc">{item.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__quote card" delay={200}>
          <blockquote>
            <p>&ldquo;{ABOUT_STORY.quote.text}&rdquo;</p>
            <cite>— {ABOUT_STORY.quote.author}</cite>
          </blockquote>
          <Link to="/craftsmanship" className="btn btn-outline content-page__link">
            See Our Craftsmanship
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
