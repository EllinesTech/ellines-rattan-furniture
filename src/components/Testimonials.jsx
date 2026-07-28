import { useEffect, useState } from 'react'
import { TESTIMONIALS as FALLBACK } from '../data/site'
import { subscribeTestimonials } from '../utils/cms'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './Testimonials.css'

function Stars({ count }) {
  return (
    <span className="testimonials__stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} aria-hidden="true">★</span>
      ))}
    </span>
  )
}

function toPublicList(items) {
  if (items?.length) {
    return items
      .filter((t) => t.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }
  return FALLBACK.map((t, i) => ({ ...t, id: `fb_${i}`, photo: '', beforePhoto: '', afterPhoto: '' }))
}

export default function Testimonials() {
  const [items, setItems] = useState(() => toPublicList(null))

  useEffect(() => {
    return subscribeTestimonials((list) => setItems(toPublicList(list)))
  }, [])

  return (
    <section className="testimonials section" aria-label="Client testimonials">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="section-eyebrow">Client Stories</p>
          <h2>Loved by Homes &amp; Hospitality</h2>
          <p>
            Real feedback from clients who chose Ellines for custom rattan furniture
            across Kenya.
          </p>
        </Reveal>

        <div className="testimonials__track">
          {items.map((item, i) => (
            <Reveal key={item.id || item.name} className="testimonials__slide" delay={i * 80}>
              <blockquote className="testimonials__card card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                {item.photo && (
                  <div className="testimonials__photo">
                    <OptimizedImage src={item.photo} alt="" loading="lazy" useThumb thumbWidth={480} />
                  </div>
                )}
                <div className="card__body">
                  <Stars count={item.rating || 5} />
                  <p className="testimonials__quote">&ldquo;{item.quote}&rdquo;</p>
                  {(item.beforePhoto || item.afterPhoto) && (
                    <div className="testimonials__ba">
                      {item.beforePhoto && (
                        <figure>
                          <OptimizedImage src={item.beforePhoto} alt="" loading="lazy" useThumb thumbWidth={320} />
                          <figcaption>Before</figcaption>
                        </figure>
                      )}
                      {item.afterPhoto && (
                        <figure>
                          <OptimizedImage src={item.afterPhoto} alt="" loading="lazy" useThumb thumbWidth={320} />
                          <figcaption>After</figcaption>
                        </figure>
                      )}
                    </div>
                  )}
                  <footer>
                    <cite className="testimonials__name">{item.name}</cite>
                    <span className="testimonials__role">{item.role}</span>
                  </footer>
                </div>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
