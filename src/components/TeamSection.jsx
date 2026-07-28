import { Link } from 'react-router-dom'
import { ABOUT_TEAM } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function TeamSection({ standalone = false }) {
  const meta = usePageMeta('aboutTeam')
  const c = meta.content || {}
  const intro = c.intro?.length ? c.intro : [ABOUT_TEAM.intro]
  const cards = c.cards?.length
    ? c.cards.map((card) => {
        const [location, ...rest] = (card.desc || '').split(' — ')
        return {
          title: card.title,
          image: card.image,
          location: rest.length ? location : '',
          desc: rest.length ? rest.join(' — ') : card.desc,
        }
      })
    : ABOUT_TEAM.members

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Our People'}</p>
            <h2>{c.sectionHeading || 'The Workshop Team'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          {intro.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </Reveal>

        <div className="card-grid card-grid--3 about-team__grid">
          {cards.map((member, i) => (
            <Reveal key={member.title} delay={i * 70}>
              <article className="card card--interactive about-team__card">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__media card__media--4x3">
                  <OptimizedImage
                    src={member.image}
                    alt={member.title}
                    loading="lazy"
                    useThumb
                    thumbWidth={640}
                  />
                </div>
                <div className="card__body">
                  {member.location && <span className="about-team__location">{member.location}</span>}
                  <h3 className="card__title">{member.title}</h3>
                  <p className="card__desc">{member.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__cta card" delay={150}>
          <p>{c.ctaBand?.heading || ABOUT_TEAM.cta}</p>
          <div className="content-page__cta-row">
            <Link to={c.ctaBand?.primaryTo || '/contact'} className="btn btn-primary">
              {c.ctaBand?.primaryLabel || 'Contact us'}
            </Link>
            <Link to={c.ctaBand?.secondaryTo || '/about/founder'} className="btn btn-outline">
              {c.ctaBand?.secondaryLabel || 'The Founder'}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
