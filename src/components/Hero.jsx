import { Link } from 'react-router-dom'
import { HERO_IMAGE, HERO_TRUST, SITE } from '../data/site'
import OptimizedImage from './OptimizedImage'
import './Hero.css'

export default function Hero() {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <>
      <section className="hero" aria-label="Introduction">
        <div className="hero__bg" aria-hidden="true">
          <OptimizedImage
            src={HERO_IMAGE.src}
            alt=""
            className="hero__bg-img"
            loading="eager"
            fetchPriority="high"
            objectPosition={HERO_IMAGE.position}
            useThumb
            thumbWidth={1920}
          />
          <div className="hero__bg-veil" />
        </div>

        <div className="container hero__content">
          <div className="hero__copy">
            <p className="hero__eyebrow">Nyeri &amp; Nairobi Workshops</p>
            <h1 className="hero__h1">
              <span className="hero__script">Ellines</span>
              <span className="hero__headline gold-text">{SITE.tagline}</span>
            </h1>
            <p className="hero__sub">
              Handcrafted synthetic rattan furniture — custom sofas, armchairs,
              cabinets, and outdoor sets woven by skilled Kenyan artisans.
            </p>
            <div className="hero__btns">
              <Link to="/shop" className="btn btn-primary hero__cta-primary">
                Shop Collection
              </Link>
              <Link to="/services" className="btn btn-outline hero__cta-secondary">
                Our Services
              </Link>
              <a
                href={waUrl}
                className="btn btn-wa hero__cta-wa"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Quote
              </a>
            </div>
          </div>
        </div>

        <div className="hero-trust hero-trust--in-hero">
          <div className="container hero-trust__inner">
            {HERO_TRUST.map((item, i) => (
              <div key={item.title} className="hero-trust__item">
                <span className="hero-trust__mark" aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
                {i < HERO_TRUST.length - 1 && <div className="hero-trust__bar" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
