import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import './HomeCta.css'

const LINKS = [
  {
    path: '/craftsmanship',
    label: 'Our Craftsmanship',
    desc: 'See how we hand-weave every piece in Nyeri & Nairobi',
    image: '/images/projects/project-craftsmanship-hand-weave.jpg',
  },
  {
    path: '/projects',
    label: 'View Projects',
    desc: 'Browse living sets, sofas, armchairs, cabinets & more',
    image: '/images/projects/project-original-cabinet-gold.jpg',
  },
  {
    path: '/services',
    label: 'Our Services',
    desc: 'Custom furniture tailored to your space and style',
    image: '/images/projects/project-original-modular-collection.jpg',
  },
  {
    path: '/materials',
    label: 'Materials & Care',
    desc: 'Premium rattan, frames, and maintenance guides',
    image: '/images/projects/project-craftsmanship-chevron-detail.jpg',
  },
]

export default function HomeCta() {
  return (
    <section className="home-cta section" aria-label="Explore more">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="section-eyebrow">Explore Ellines</p>
          <h2>Discover Our World of Rattan</h2>
          <p>Each page tells a part of our story — craftsmanship, projects, and custom builds.</p>
        </Reveal>

        <div className="home-cta__grid card-grid card-grid--2">
          {LINKS.map((item, i) => (
            <Reveal key={item.path} delay={i * 90}>
              <Link to={item.path} className="home-cta__card card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="home-cta__media card__media card__media--16x10">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="home-cta__body card__body">
                  <h3 className="card__title">{item.label}</h3>
                  <p className="card__desc">{item.desc}</p>
                  <span className="card__footer">Explore →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="home-cta__contact" delay={200}>
          <Link to="/contact" className="btn btn-primary">
            Start Your Custom Project
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
