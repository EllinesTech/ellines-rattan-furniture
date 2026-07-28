import { Link } from 'react-router-dom'
import { ABOUT_STORY } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function AboutStory({ standalone = false }) {
  const meta = usePageMeta('about')
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : ABOUT_STORY.intro
  const cards = c.cards?.length ? c.cards : ABOUT_STORY.values
  const founder = ABOUT_STORY.founder
  const group = ABOUT_STORY.group

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Our Story'}</p>
            <h2>{c.sectionHeading || 'The Ellines Journey'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          {intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </Reveal>

        <div className="card-grid card-grid--3">
          {cards.map((item, i) => (
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

        {founder && (
          <Reveal className="about-people card" delay={120}>
            <div className="about-people__copy">
              <p className="section-eyebrow">People</p>
              <h2>{c.peopleHeading || 'Meet the people behind Ellines'}</h2>
              <p>
                {c.peopleText ||
                  `From workshop artisans in Nyeri and Nairobi to ${founder.name}, founder of Ellines Group — discover the team and leadership behind every handcrafted piece.`}
              </p>
            </div>
            <div className="about-people__links">
              <Link to="/about/team" className="btn btn-primary">The Team</Link>
              <Link to="/about/founder" className="btn btn-outline">The Founder</Link>
            </div>
          </Reveal>
        )}

        {group && (
          <Reveal className="about-group" delay={160}>
            <div className="section-head section-head--center">
              <p className="section-eyebrow">Company Group</p>
              <h2>{c.groupTitle || group.title}</h2>
              <p>{c.groupIntro || group.intro}</p>
            </div>
            <div className="card-grid card-grid--3 about-group__grid">
              {group.companies.map((company, i) => (
                <Reveal key={company.name} delay={i * 70}>
                  <article className="about-group__card card">
                    <span className="about-group__tag">{company.tag}</span>
                    <h3>{company.name}</h3>
                    <p>{company.desc}</p>
                    {company.external ? (
                      <a href={company.href} target="_blank" rel="noopener noreferrer" className="about-group__link">
                        Visit {company.name.replace('Ellines ', '')}
                      </a>
                    ) : (
                      <Link to="/shop" className="about-group__link">
                        Explore furniture
                      </Link>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {(c.quote || ABOUT_STORY.quote) && (
          <Reveal className="about-quote" delay={200}>
            <blockquote>
              <p>“{c.quote || ABOUT_STORY.quote.text}”</p>
              <cite>— {c.quoteAuthor || ABOUT_STORY.quote.author}</cite>
            </blockquote>
          </Reveal>
        )}
      </div>
    </section>
  )
}
