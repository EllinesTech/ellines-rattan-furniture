import { useEffect, useState } from 'react'
import { HERO_IMAGES, SITE } from '../data/site'
import './Hero.css'

export default function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="hero__bg" aria-hidden="true">
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`hero__bg-img ${i === active ? 'hero__bg-img--active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
          />
        ))}
        <div className="hero__bg-veil" />
        <div className="hero__bg-glow" />
        <div className="hero__grain" />
      </div>

      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow badge badge-gold">Handcrafted in Kenya</p>
          <h1 className="hero__title">
            <span className="hero__script">Ellines</span>
            <span className="hero__brand">Rattan Furniture</span>
          </h1>
          <span className="hero__rule" aria-hidden="true" />
          <p className="hero__tagline gold-text">{SITE.tagline}</p>
          <p className="hero__lead">
            Handcrafted synthetic rattan furniture — custom sofas, armchairs, cabinets,
            tables, and outdoor sets. Workshop craftsmanship meets modern design.
          </p>
          <div className="hero__actions">
            <a href={waUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Request a Quote
            </a>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Our Work
            </button>
          </div>
          <div className="hero__stats">
            <div>
              <strong>16+</strong>
              <span>Completed Projects</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Hand-Woven</span>
            </div>
            <div>
              <strong>Custom</strong>
              <span>Made to Order</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__frame">
            <img
              src={HERO_IMAGES[active]}
              alt="Ellines Rattan Furniture showcase"
              className="hero__featured"
              width="640"
              height="480"
            />
            <img
              src="/images/logos/ellines-rattan-logo-circle.png"
              alt=""
              className="hero__emblem"
              width="96"
              height="96"
              loading="lazy"
            />
          </div>
          <div className="hero__dots" role="tablist" aria-label="Hero images">
            {HERO_IMAGES.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show image ${i + 1}`}
                className={`hero__dot ${i === active ? 'hero__dot--active' : ''}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
