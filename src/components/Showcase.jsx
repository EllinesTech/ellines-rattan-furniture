import { FEATURED_SHOWCASE } from '../data/site'
import Reveal from './Reveal'
import './Showcase.css'

export default function Showcase() {
  const scrollToGallery = (category) => {
    const gallery = document.getElementById('gallery')
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth' })
      if (category && category !== 'All') {
        setTimeout(() => {
          const buttons = gallery.querySelectorAll('.gallery__filter')
          buttons.forEach((btn) => {
            if (btn.textContent === category) btn.click()
          })
        }, 600)
      }
    }
  }

  return (
    <section className="showcase" aria-label="Featured work">
      <div className="container">
        <Reveal className="showcase__head">
          <p className="section-eyebrow">Signature Pieces</p>
          <h2>From Our Workshop</h2>
          <p className="showcase__sub">
            A preview of what our Nyeri and Nairobi artisans create — tap any piece to explore more.
          </p>
        </Reveal>

        <div className="showcase__grid">
          {FEATURED_SHOWCASE.map((item, i) => (
            <Reveal key={item.src} delay={i * 90}>
              <button
                type="button"
                className="showcase__card"
                onClick={() => scrollToGallery(item.category)}
              >
                <div className="showcase__media">
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <span className="showcase__overlay">
                    <span className="showcase__cat">{item.category}</span>
                    <span className="showcase__title">{item.title}</span>
                    <span className="showcase__hint">View in gallery →</span>
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="showcase__cta-wrap" delay={200}>
          <button
            type="button"
            className="btn btn-outline showcase__cta"
            onClick={() => scrollToGallery('All')}
          >
            View All Projects
          </button>
        </Reveal>
      </div>
    </section>
  )
}
