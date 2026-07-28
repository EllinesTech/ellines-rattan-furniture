import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { useApp } from '../context/AppContext'
import { DEFAULT_PAGE_CONTENT } from '../data/seedPageContent'
import '../components/ContentPages.css'

export default function FinancingPage() {
  const { pageContent } = useApp()
  const f = pageContent?.financing || DEFAULT_PAGE_CONTENT.financing

  return (
    <>
      <PageHero
        compact
        eyebrow={f.eyebrow || 'Payment & Financing'}
        title={f.heading || 'Workshop-friendly payments'}
        subtitle="Deposit, staged milestones, and M-Pesa-friendly settlement for custom furniture in Kenya."
        image="/images/projects/project-original-coffee-table.jpg"
        position="center 40%"
      />
      <section className="section content-page content-page--standalone">
        <div className="container">
          <Reveal className="content-page__intro">
            {(f.intro || []).map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </Reveal>

          <div className="card-grid card-grid--2">
            {(f.sections || []).map((section, i) => (
              <Reveal key={section.title || i} delay={i * 70}>
                <article className="card">
                  <div className="card__body">
                    <h3 className="card__title">{section.title}</h3>
                    <p className="card__desc">{section.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {f.note && (
            <Reveal className="content-page__intro" delay={100}>
              <p>{f.note}</p>
            </Reveal>
          )}

          <Reveal className="content-page__cta card" delay={120}>
            <p>Ready to map a payment plan to your build?</p>
            <div className="content-page__cta-row">
              <Link to={f.ctaTo || '/quote'} className="btn btn-primary">
                {f.ctaLabel || 'Request a quote'}
              </Link>
              <Link to={f.secondaryTo || '/visit'} className="btn btn-outline">
                {f.secondaryLabel || 'Book a visit'}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
