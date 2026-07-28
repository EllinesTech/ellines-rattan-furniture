import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'
import { FRAME_CHOICE_NOTE, PRICING_VARIES_NOTE, WEAVE_NOTE } from '../data/productOptions'
import { formatKes } from '../utils/auth'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './ContentPages.css'
import './CatalogueSection.css'

export default function CatalogueSection({ standalone = false }) {
  const { activeProducts } = useApp()
  const meta = usePageMeta('catalogue')
  const c = meta.content || {}
  const intro = c.intro?.length
    ? c.intro
    : [
        'A workshop catalogue of active pieces — starting prices for a base configuration. Frame material, weave, and cushions change the final quote.',
      ]

  const byCategory = activeProducts.reduce((acc, product) => {
    const key = product.category || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(product)
    return acc
  }, {})

  const categories = Object.keys(byCategory).sort((a, b) => a.localeCompare(b))

  const handlePrint = () => {
    window.print()
  }

  return (
    <section
      className={`section content-page catalogue-page ${standalone ? 'content-page--standalone' : ''}`}
    >
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">{c.sectionEyebrow || 'Workshop Catalogue'}</p>
            <h2>{c.sectionHeading || 'Printable Catalogue'}</h2>
          </Reveal>
        )}

        <Reveal className="content-page__intro catalogue-page__intro no-print-hide">
          {intro.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </Reveal>

        <Reveal className="catalogue-toolbar no-print" delay={40}>
          <p>
            {WEAVE_NOTE} {FRAME_CHOICE_NOTE} {PRICING_VARIES_NOTE}
          </p>
          <div className="content-page__cta-row">
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              Print / Save PDF
            </button>
            <Link to="/shop" className="btn btn-outline">
              Open shop
            </Link>
            <Link to="/quote" className="btn btn-outline">
              Build a quote
            </Link>
          </div>
        </Reveal>

        <div className="catalogue-print-header print-only">
          <img
            src="/images/logos/ellines-rattan-logo-transparent.png"
            alt=""
            width="64"
            height="64"
          />
          <div>
            <strong>{SITE.name}</strong>
            <p>{SITE.tagline} — {SITE.location}</p>
            <p>
              {SITE.phones.map((p) => p.display).join(' · ')} · {SITE.email}
            </p>
            <p className="catalogue-print-header__note">
              Starting prices · synthetic rattan · frames & finishes priced separately
            </p>
          </div>
        </div>

        {categories.length === 0 ? (
          <Reveal className="catalogue-empty card">
            <p>No catalogue pieces are listed yet. Browse Projects or contact us for a custom brief.</p>
            <div className="content-page__cta-row">
              <Link to="/projects" className="btn btn-outline">
                View projects
              </Link>
              <Link to="/contact" className="btn btn-primary">
                Contact
              </Link>
            </div>
          </Reveal>
        ) : (
          categories.map((cat) => (
            <Reveal key={cat} className="catalogue-group content-page__block">
              <h3 className="content-page__subtitle catalogue-group__title">{cat}</h3>
              <div className="catalogue-grid">
                {byCategory[cat].map((product) => (
                  <article key={product.id} className="catalogue-item card">
                    <div className="catalogue-item__media">
                      <OptimizedImage
                        src={product.src || product.image}
                        alt={product.title}
                        loading="lazy"
                        useThumb
                        thumbWidth={480}
                      />
                    </div>
                    <div className="catalogue-item__body">
                      <h4>{product.title}</h4>
                      <p>{product.description || product.shortDesc || 'Custom synthetic rattan piece.'}</p>
                      <div className="catalogue-item__meta">
                        <span>
                          {product.quoteOnly || product.startingPrice == null
                            ? 'Quote on request'
                            : `From ${formatKes(product.startingPrice)}`}
                        </span>
                        {product.id && <span>Ref {product.id}</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          ))
        )}

        <Reveal className="content-page__cta card no-print" delay={120}>
          <p>Ready to customise? Add pieces in Shop, then request a workshop quote.</p>
          <div className="content-page__cta-row">
            <Link to="/shop" className="btn btn-primary">
              Shop collection
            </Link>
            <Link to="/visit" className="btn btn-outline">
              Book a visit
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
