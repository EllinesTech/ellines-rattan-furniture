import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import './HomeJourney.css'

const STEPS = [
  {
    num: '01',
    title: 'Browse the shop',
    desc: 'Explore synthetic rattan pieces for any space — bedroom, lounge, terrace, or business.',
    to: '/shop',
    label: 'Shop collection',
  },
  {
    num: '02',
    title: 'Build your quote',
    desc: 'Choose frame materials, add services if needed, and request a transparent workshop estimate.',
    to: '/quote',
    label: 'Request a quote',
  },
  {
    num: '03',
    title: 'Measure & visit',
    desc: 'Use our space guide, then book a Nairobi showroom visit or paid consultation.',
    to: '/visit',
    label: 'Book a visit',
  },
]

export default function HomeJourney() {
  return (
    <section className="home-journey section" aria-label="How to start">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="section-eyebrow">Your Path</p>
          <h2>Shop → Quote → Any Space</h2>
          <p>
            From catalogue browsing to custom weave — a clear path for homes and hospitality projects.
          </p>
        </Reveal>

        <div className="home-journey__grid">
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 90} className="home-journey__step">
              <article className="home-journey__card card">
                <span className="home-journey__num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <Link to={step.to} className="home-journey__link">
                  {step.label} →
                </Link>
              </article>
              {i < STEPS.length - 1 && <span className="home-journey__arrow" aria-hidden="true" />}
            </Reveal>
          ))}
        </div>

        <Reveal className="home-journey__extras" delay={200}>
          <Link to="/guide" className="btn btn-outline">
            Measurement guide
          </Link>
          <Link to="/catalogue" className="btn btn-outline">
            Printable catalogue
          </Link>
          <Link to="/materials" className="btn btn-outline">
            Why synthetic rattan
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
