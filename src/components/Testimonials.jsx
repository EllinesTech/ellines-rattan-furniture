import { TESTIMONIALS } from '../data/site'
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

export default function Testimonials() {
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
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} className="testimonials__slide" delay={i * 80}>
              <blockquote className="testimonials__card card card--interactive">
                <span className="card__shine" aria-hidden="true" />
                <div className="card__body">
                <Stars count={item.rating} />
                <p className="testimonials__quote">&ldquo;{item.quote}&rdquo;</p>
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
