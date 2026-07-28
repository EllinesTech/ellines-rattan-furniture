import { Link } from 'react-router-dom'
import { ABOUT_STORY } from '../data/content'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'

export default function FounderProfile({ standalone = false }) {
  const { founder } = ABOUT_STORY
  if (!founder) return null

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        <Reveal className="about-founder about-founder--page">
          <div className="about-founder__media">
            <OptimizedImage
              src={founder.image}
              alt={`${founder.name}, Founder of Ellines Group`}
              loading="lazy"
              useThumb
              thumbWidth={960}
            />
          </div>
          <div className="about-founder__copy">
            {!standalone && <p className="section-eyebrow">Meet the Founder</p>}
            <h2>{founder.name}</h2>
            <p className="about-founder__role">{founder.role}</p>
            {founder.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            <div className="about-founder__actions">
              <Link to="/contact" className="btn btn-primary">
                Visit our workshops
              </Link>
              <a
                href="https://tech.ellines.co.ke/"
                className="btn btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ellines Group
              </a>
            </div>
          </div>
        </Reveal>

        {ABOUT_STORY.group && (
          <Reveal className="about-group" delay={120}>
            <div className="section-head section-head--center">
              <p className="section-eyebrow">Company Group</p>
              <h2>{ABOUT_STORY.group.title}</h2>
              <p>{ABOUT_STORY.group.intro}</p>
            </div>
            <div className="card-grid card-grid--3 about-group__grid">
              {ABOUT_STORY.group.companies.map((company, i) => (
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
      </div>
    </section>
  )
}
