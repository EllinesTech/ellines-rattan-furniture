import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import OptimizedImage from '../components/OptimizedImage'
import Reveal from '../components/Reveal'
import { useApp } from '../context/AppContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'
import {
  ANY_SPACE_NOTE,
  FRAME_CHOICE_NOTE,
  PRICING_VARIES_NOTE,
  WEAVE_MATERIAL,
  WEAVE_NOTE,
} from '../data/productOptions'
import { formatKes } from '../utils/auth'
import { SHOP_CATEGORIES } from '../data/seedProducts'
import './ShopPage.css'

const TRUST_CUES = [
  { icon: '✦', title: 'Synthetic rattan', desc: 'Premium weather-resistant weave' },
  { icon: '◆', title: 'Frame your way', desc: 'Metal, aluminium, wood & more' },
  { icon: '◇', title: 'Prices vary', desc: 'Starting guides — final quote by options' },
  { icon: '○', title: 'Any space', desc: 'Bedroom to business — tailored to fit' },
]

export default function ShopPage() {
  const { activeProducts, addToQuote, quoteCount, showToast } = useApp()
  const meta = usePageMeta('shop')
  const trustCues = meta.content?.trust?.length
    ? meta.content.trust.map((t, i) => ({
        icon: TRUST_CUES[i % TRUST_CUES.length].icon,
        title: t.title,
        desc: t.desc,
      }))
    : TRUST_CUES
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [addedId, setAddedId] = useState(null)

  const filtered = useMemo(() => {
    return activeProducts.filter((p) => {
      const matchCat = category === 'All' || p.category === category
      const q = search.trim().toLowerCase()
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [activeProducts, category, search])

  const handleAdd = (product) => {
    addToQuote(product, 1)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1800)
    showToast(`Added “${product.title}” to your quote`, {
      actionHref: '/quote',
      actionLabel: `View quote (${quoteCount + 1})`,
    })
  }

  const waLink = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <>
      <PageHero
        compact
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
        actions={
          <>
            <Link to="/quote" className="btn btn-primary">
              View quote
              {quoteCount > 0 && <span className="shop__quote-badge">{quoteCount}</span>}
            </Link>
            <a href={waLink} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
              WhatsApp Quote
            </a>
            <Link to="/services" className="btn btn-outline">
              Custom Services
            </Link>
          </>
        }
      />

      <section className="shop-trust">
        <div className="container shop-trust__grid">
          {trustCues.map((cue) => (
            <div key={cue.title} className="shop-trust__item">
              <span className="shop-trust__icon">{cue.icon}</span>
              <div>
                <strong>{cue.title}</strong>
                <span>{cue.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section shop">
        <div className="container">
          <div className="shop__header">
            <div className="section-head">
              <span className="section-eyebrow">Shop</span>
              <h2>Workshop catalogue</h2>
              <p>
                {activeProducts.length} pieces available — woven in {WEAVE_MATERIAL.toLowerCase()}.
                {' '}{PRICING_VARIES_NOTE}
              </p>
            </div>
            <Link to="/quote" className="btn btn-primary shop__quote-cta">
              View quote
              {quoteCount > 0 && <span className="shop__quote-badge">{quoteCount}</span>}
            </Link>
          </div>

          <div className="shop__materials-note card">
            <div>
              <p>
                <strong>Weave:</strong> {WEAVE_NOTE}{' '}
                <strong>Frames:</strong> {FRAME_CHOICE_NOTE}
              </p>
              <p className="shop__materials-note-space">{ANY_SPACE_NOTE}</p>
            </div>
            <Link to="/materials" className="shop__materials-link">
              Materials &amp; care →
            </Link>
          </div>

          <div className="shop__toolbar">
            <div className="shop__filters" role="tablist" aria-label="Product categories">
              {SHOP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={category === cat}
                  className={`shop__filter ${category === cat ? 'shop__filter--active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="shop__search-wrap">
              <label className="sr-only" htmlFor="shop-search">Search products</label>
              <svg className="shop__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                id="shop-search"
                className="shop__search field"
                type="search"
                placeholder="Search by name or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  className="shop__search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <p className="shop__result-count" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
              {category !== 'All' ? ` in ${category}` : ''}
              {search.trim() ? ` matching “${search.trim()}”` : ''}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="shop__empty card">
              <h3>No products found</h3>
              <p>Try a different category or search term.</p>
              <button type="button" className="btn btn-outline" onClick={() => { setCategory('All'); setSearch('') }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="shop__grid">
              {filtered.map((product, i) => (
                <Reveal key={product.id} delay={i * 40}>
                  <article className="shop-card card card--interactive">
                    <div className="card__shine" />
                    <div className="shop-card__media card__media card__media--4x3">
                      <OptimizedImage src={product.src} alt={product.title} loading="lazy" />
                      <span className="card__badge shop-card__category-badge">{product.category}</span>
                      {product.featured && <span className="shop-card__featured">Featured</span>}
                    </div>
                    <div className="shop-card__body card__body">
                      <h3 className="card__title">{product.title}</h3>
                      <p className="card__desc">{product.description}</p>
                      <p className="shop-card__materials">
                        <span>{product.weaveMaterial || WEAVE_MATERIAL} weave</span>
                        <span>Frames: metal · aluminium · wood</span>
                      </p>
                      <div className="shop-card__footer">
                        <span className="shop-card__price">
                          {product.quoteOnly
                            ? 'Price on request'
                            : `From ${formatKes(product.startingPrice)}`}
                          {!product.quoteOnly && (
                            <small className="shop-card__price-note">Base config · options vary</small>
                          )}
                        </span>
                        <div className="shop-card__actions">
                          <button
                            type="button"
                            className={`btn ${addedId === product.id ? 'btn-outline shop-card__added' : 'btn-primary'}`}
                            onClick={() => handleAdd(product)}
                          >
                            {addedId === product.id ? 'Added ✓' : 'Add to quote'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <div className="shop__bottom-cta card">
            <div>
              <h3>Need something bespoke?</h3>
              <p>
                Tailored for any space — bedroom, living room, or business. Share dimensions or a sketch and we&apos;ll quote with your preferred frame material.
              </p>
            </div>
            <div className="shop__bottom-actions">
              <Link to="/services" className="btn btn-outline">Request a service</Link>
              <Link to="/quote" className="btn btn-primary">Build a quote</Link>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>

      {quoteCount > 0 && (
        <div className="shop-sticky-bar shop-sticky-bar--visible">
          <div className="shop-sticky-bar__copy">
            <strong>{quoteCount} in your quote</strong>
            Ready to submit?
          </div>
          <Link to="/quote" className="btn btn-primary">View quote</Link>
        </div>
      )}
    </>
  )
}
