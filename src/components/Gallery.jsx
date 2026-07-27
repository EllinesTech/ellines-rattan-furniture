import { useMemo, useState } from 'react'
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '../data/gallery'
import './Gallery.css'

export default function Gallery() {
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const items = useMemo(() => {
    if (filter === 'All') return GALLERY_ITEMS
    return GALLERY_ITEMS.filter((item) => item.category === filter)
  }, [filter])

  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <div className="section-head">
          <p className="section-eyebrow">Our Work</p>
          <h2>Project Gallery</h2>
          <p>
            A selection of completed sofas, armchairs, cabinets, tables, and workshop builds —
            each hand-woven to order.
          </p>
        </div>

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

        <div className="gallery__grid">
          {items.map((item) => (
            <button
              key={item.src}
              type="button"
              className={`gallery__item ${item.featured ? 'gallery__item--featured' : ''}`}
              onClick={() => setLightbox(item)}
            >
              <img src={item.src} alt={item.title} loading="lazy" />
              <span className="gallery__overlay">
                <span className="gallery__category">{item.category}</span>
                <span className="gallery__title">{item.title}</span>
              </span>
            </button>
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
              className="lightbox__close"
              aria-label="Close"
              onClick={() => setLightbox(null)}
            >
              ×
            </button>
            <img src={lightbox.src} alt={lightbox.title} />
            <p>
              <strong>{lightbox.title}</strong> — {lightbox.category}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
