import { ABOUT_STATS, CRAFTSMANSHIP, SITE } from '../data/site'
import OptimizedImage from './OptimizedImage'
import { useCountUp, useScrollReveal } from '../hooks/useScrollReveal'
import Reveal from './Reveal'
import './About.css'

function StatItem({ stat, index }) {
  const [ref, visible] = useScrollReveal()
  const count = useCountUp(stat.count, visible)

  return (
    <div ref={ref} className={`about__stat reveal ${visible ? 'reveal--visible' : ''}`} style={{ '--reveal-delay': `${index * 100}ms` }}>
      <span className="about__stat-value">
        {stat.count != null ? `${count}${stat.suffix}` : stat.value}
      </span>
      <span className="about__stat-label">{stat.label}</span>
    </div>
  )
}

export default function About({ standalone = false }) {
  return (
    <section id={standalone ? undefined : 'about'} className={`section about ${standalone ? 'about--page' : ''}`}>
      <div className="container">
        <div className="about__intro">
          <Reveal className="about__copy">
            <p className="section-eyebrow">Our Craft</p>
            <h2>Workshop Craftsmanship,<br />Modern Design</h2>
            <p>
              At Ellines Rattan Furniture, every piece begins in our workshops in{' '}
              <strong>Nyeri</strong> and <strong>Nairobi</strong> — where skilled Kenyan
              artisans weave premium synthetic rattan onto precision metal frames by hand.
            </p>
            <p>
              From bold black-and-white checkered patterns to warm brown weaves and geometric
              chevrons, we create furniture that is beautiful, durable, and built for Kenyan
              homes and hospitality spaces.
            </p>
            <ul className="about__list">
              <li>Premium synthetic rattan — weather-resistant &amp; long-lasting</li>
              <li>Custom sizes, colours, and weave patterns</li>
              <li>Nairobi showroom · Nyeri production atelier</li>
              <li>Direct workshop pricing with personal consultation</li>
            </ul>
          </Reveal>

          <Reveal className="about__side reveal--right" delay={120}>
            <div className="about__workshops card">
              <h3>Our Workshops</h3>
              {SITE.workshops.map((w) => (
                <div key={w.city} className="about__workshop">
                  <span className="about__workshop-city">{w.city}</span>
                  <span className="about__workshop-label">{w.label}</span>
                  <span className="about__workshop-desc">{w.description}</span>
                </div>
              ))}
              <p className="about__workshop-hours">{SITE.hours}</p>
            </div>

            <img
              src="/images/logos/ellines-rattan-logo-banner.png"
              alt={SITE.name}
              className="about__banner"
              loading="lazy"
              width="1914"
              height="822"
            />
          </Reveal>
        </div>

        <div className="about__stats">
          {ABOUT_STATS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        <Reveal className="about__gallery-head" delay={80}>
          <div className="section-divider">
            <span className="section-divider__line" />
            <span className="section-divider__mark">✦</span>
            <span className="section-divider__line" />
          </div>
          <p className="about__gallery-title">Behind every piece — hands at work</p>
        </Reveal>

        <div className="about__gallery">
          {CRAFTSMANSHIP.map((item, i) => (
            <Reveal key={item.src} delay={i * 80}>
              <figure className="about__card">
                <div className="about__card-media">
                  <OptimizedImage src={item.src} alt={item.alt} loading="lazy" useThumb thumbWidth={480} />
                </div>
                <figcaption>{item.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
