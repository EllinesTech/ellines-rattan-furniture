import { Link } from 'react-router-dom'
import { ABOUT_TEAM } from '../data/content'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function TeamSection({ standalone = false }) {
  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">Our People</p>
            <h2>The Workshop Team</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro">
          <p>{ABOUT_TEAM.intro}</p>
        </Reveal>

        <div className="card-grid card-grid--3 about-team__grid">
          {ABOUT_TEAM.members.map((member, i) => (
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
                  <span className="about-team__location">{member.location}</span>
                  <h3 className="card__title">{member.title}</h3>
                  <p className="card__desc">{member.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__cta card" delay={160}>
          <p>{ABOUT_TEAM.cta}</p>
          <div className="content-page__cta-row">
            <Link to="/contact" className="btn btn-primary">Visit a workshop</Link>
            <Link to="/about/founder" className="btn btn-outline">Meet the Founder</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
