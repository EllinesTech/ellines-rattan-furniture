import { Link } from 'react-router-dom'
import { HERO_IMAGE, HERO_TRUST, SITE } from '../data/site'
import { usePageMeta } from '../hooks/usePageMeta'
import OptimizedImage from './OptimizedImage'
import './Hero.css'

export default function Hero() {
  const meta = usePageMeta('home')
  const c = meta.content || {}
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`
  const heroSrc = meta.heroImage || HERO_IMAGE.src
  const heroPos = meta.heroPosition || HERO_IMAGE.position
  const trust = c.trust?.length
    ? c.trust
    : HERO_TRUST.map((t) => ({ title: t.title, desc: t.desc }))
  const ctas = c.ctas?.length
    ? c.ctas
    : [
        { label: 'Shop Collection', to: '/shop', variant: 'primary' },
        { label: 'Our Services', to: '/services', variant: 'outline' },
        { label: 'WhatsApp Quote', href: 'whatsapp', variant: 'wa' },
      ]

  const renderCta = (cta, i) => {
    const cls =
      cta.variant === 'primary'
        ? 'btn btn-primary hero__cta-primary'
        : cta.variant === 'wa'
          ? 'btn btn-wa hero__cta-wa'
          : 'btn btn-outline hero__cta-secondary'
    if (cta.variant === 'wa' || cta.href === 'whatsapp') {
      return (
        <a key={i} href={waUrl} className={cls} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      )
    }
    if (cta.href) {
      return (
        <a key={i} href={cta.href} className={cls} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      )
    }
    return (
      <Link key={i} to={cta.to || '/'} className={cls}>
        {cta.label}
      </Link>
    )
  }

  return (
    <>
      <section className="hero" aria-label="Introduction">
        <div className="hero__bg" aria-hidden="true">
          <OptimizedImage
            src={heroSrc}
            alt=""
            className="hero__bg-img"
            loading="eager"
            fetchPriority="high"
            objectPosition={heroPos}
            useThumb
            thumbWidth={1920}
          />
          <div className="hero__bg-veil" />
        </div>

        <div className="container hero__content">
          <div className="hero__copy">
            <p className="hero__eyebrow">{meta.eyebrow || 'Nyeri & Nairobi Workshops'}</p>
            <h1 className="hero__h1">
              <span className="hero__script">Ellines</span>
              <span className="hero__headline gold-text">{meta.heading || SITE.tagline}</span>
            </h1>
            <p className="hero__sub">
              {meta.sub ||
                'Handcrafted synthetic rattan furniture — custom sofas, armchairs, cabinets, and outdoor sets woven by skilled Kenyan artisans.'}
            </p>
            <div className="hero__btns">{ctas.map(renderCta)}</div>
          </div>
        </div>

        <div className="hero-trust hero-trust--in-hero">
          <div className="container hero-trust__inner">
            {trust.map((item, i) => (
              <div key={item.title} className="hero-trust__item">
                <span className="hero-trust__mark" aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
                {i < trust.length - 1 && <div className="hero-trust__bar" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
