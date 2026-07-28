import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import OptimizedImage from '../components/OptimizedImage'
import Reveal from '../components/Reveal'
import { useApp } from '../context/AppContext'
import { SITE } from '../data/site'
import { formatKes } from '../utils/auth'
import { SHOP_CATEGORIES } from '../data/seedProducts'
import './ShopPage.css'

const TRUST_CUES = [
  { icon: '✦', title: 'Workshop-made', desc: 'Hand-woven in Nyeri & Nairobi' },
  { icon: '◆', title: 'Custom quotes', desc: 'Tailored to your space & budget' },
  { icon: '◇', title: 'Nationwide delivery', desc: 'Careful delivery across Kenya' },
]

export default function ShopPage() {
  const { activeProducts, addToQuote, quoteCount } = useApp()
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
  }

  const waLink = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <>
      <PageHero
        compact
        eyebrow="Catalogue"
        title="Handcrafted Rattan Collection"
        subtitle="Browse workshop pieces — add to your quote list for a personalised estimate from our atelier."
        image="/images/projects/project-original-modular-sections.jpg"
        position="center 35%"
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
          {TRUST_CUES.map((cue) => (
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
              <p>{activeProducts.length} pieces available — pricing is a starting guide; final quotes depend on size, weave, and finish.</p>
            </div>
            <Link to="/quote" className="btn btn-primary shop__quote-cta">
              View quote
              {quoteCount > 0 && <span className="shop__quote-badge">{quoteCount}</span>}
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
                      <div className="shop-card__footer">
                        <span className="shop-card__price">
                          {product.quoteOnly
                            ? 'Price on request'
                            : `From ${formatKes(product.startingPrice)}`}
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
              <p>Share dimensions, photos, or a sketch — we&apos;ll prepare a workshop quote.</p>
            </div>
            <div className="shop__bottom-actions">
              <Link to="/quote" className="btn btn-primary">Build a quote</Link>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
