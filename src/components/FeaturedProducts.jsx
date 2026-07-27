import { FEATURED_PRODUCTS, SITE } from '../data/site'
import './FeaturedProducts.css'

export default function FeaturedProducts() {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section className="featured section" aria-labelledby="featured-heading">
      <div className="container">
        <div className="section-head section-head--center">
          <span className="section-eyebrow">Signature Pieces</span>
          <h2 id="featured-heading">Curated for Your Space</h2>
          <p>
            Handwoven synthetic rattan — tailored sizes, premium weaves, and finishes
            built for Kenyan homes and hospitality.
          </p>
        </div>

        <div className="featured__grid">
          {FEATURED_PRODUCTS.map((item) => (
            <article key={item.title} className="featured__card card">
              <div className="featured__image-wrap">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="featured__image"
                  width="400"
                  height="300"
                  loading="lazy"
                />
              </div>
              <div className="featured__body">
                <span className="featured__category">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a
                  href={waUrl}
                  className="featured__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enquire on WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
