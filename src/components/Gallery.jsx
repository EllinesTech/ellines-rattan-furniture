import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../data/gallery'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './Gallery.css'

export default function Gallery({ standalone = false }) {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const initialFilter =
    categoryParam && GALLERY_CATEGORIES.includes(categoryParam) ? categoryParam : 'All'

  const [filter, setFilter] = useState(initialFilter)
  const [lightbox, setLightbox] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    if (categoryParam && GALLERY_CATEGORIES.includes(categoryParam)) {
      setFilter(categoryParam)
    }
  }, [categoryParam])

  const items = useMemo(() => {
    if (filter === 'All') return GALLERY_ITEMS
    return GALLERY_ITEMS.filter((item) => item.category === filter)
  }, [filter])

  const openLightbox = (item) => {
    setShowOriginal(false)
    setLightbox(item)
  }

  const lightboxSrc =
    lightbox && showOriginal && lightbox.originalSrc
      ? lightbox.originalSrc
      : lightbox?.src

  const lightboxIndex = lightbox
    ? items.findIndex((item) => item.src === lightbox.src)
    : -1

  const navigateLightbox = (dir) => {
    if (lightboxIndex < 0) return
    const next = (lightboxIndex + dir + items.length) % items.length
    setShowOriginal(false)
    setLightbox(items[next])
  }

  useEffect(() => {
    if (!lightbox) return undefined

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setLightbox(null)
        return
      }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return

      const idx = items.findIndex((item) => item.src === lightbox.src)
      if (idx < 0) return

      const dir = e.key === 'ArrowRight' ? 1 : -1
      const next = (idx + dir + items.length) % items.length
      setShowOriginal(false)
      setLightbox(items[next])
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, items])

  return (
    <section className={`section gallery ${standalone ? 'gallery--page' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head">
            <p className="section-eyebrow">Our Work</p>
            <h2>Our Projects</h2>
            <p>
              Real furniture built in our Nyeri and Nairobi workshops — each piece
              hand-woven to order.
            </p>
          </Reveal>
        )}

        <Reveal delay={standalone ? 0 : 80}>
          <div className="gallery__filters" role="tablist" aria-label="Filter projects">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                className={`gallery__filter ${filter === cat ? 'gallery__filter--active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <p className="gallery__count">
          {items.length} {filter === 'All' ? 'projects' : filter.toLowerCase()}
        </p>

        <div className="gallery__grid">
          {items.map((item, i) => (
            <Reveal
              key={item.src}
              className={`gallery__item-wrap ${item.featured ? 'gallery__item-wrap--featured' : ''}`}
              delay={(i % 6) * 50}
            >
              <button
                type="button"
                className={`gallery__item ${item.featured ? 'gallery__item--featured' : ''}`}
                onClick={() => openLightbox(item)}
              >
                <OptimizedImage
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  useThumb
                  thumbWidth={640}
                />
                <span className="gallery__badge">Ellines</span>
                <span className="gallery__overlay">
                  <span className="gallery__category">{item.category}</span>
                  <span className="gallery__title">{item.title}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
        >
          <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox__nav lightbox__nav--prev"
              aria-label="Previous image"
              onClick={() => navigateLightbox(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="lightbox__close"
              aria-label="Close"
              onClick={() => setLightbox(null)}
            >
              ×
            </button>
            <OptimizedImage src={lightboxSrc} alt={lightbox.title} loading="eager" />
            <button
              type="button"
              className="lightbox__nav lightbox__nav--next"
              aria-label="Next image"
              onClick={() => navigateLightbox(1)}
            >
              ›
            </button>
            <div className="lightbox__meta">
              <p>
                <strong>{lightbox.title}</strong>
                <span className="lightbox__cat"> — {lightbox.category}</span>
              </p>
              {lightbox.originalSrc && (
                <button
                  type="button"
                  className={`lightbox__toggle ${showOriginal ? 'lightbox__toggle--active' : ''}`}
                  onClick={() => setShowOriginal((v) => !v)}
                >
                  {showOriginal ? 'View styled photo' : 'View workshop original'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
