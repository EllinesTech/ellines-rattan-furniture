import { PROCESS_STEPS, SITE } from '../data/site'
import Reveal from './Reveal'
import './Process.css'

export default function Process() {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section className="process section" aria-label="How we work">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="section-eyebrow">The Journey</p>
          <h2>From Idea to Finished Piece</h2>
          <p>
            Every Ellines project follows a clear path — consult, design, hand-weave,
            and deliver. Here is how we bring your furniture to life.
          </p>
        </Reveal>

        <div className="process__track">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.step} className="process__step" delay={i * 100}>
              <article className="process__card card">
                <div className="process__media">
                  <img src={step.image} alt="" loading="lazy" />
                  <span className="process__num">{step.step}</span>
                </div>
                <div className="process__body">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
              {i < PROCESS_STEPS.length - 1 && (
                <span className="process__connector" aria-hidden="true" />
              )}
            </Reveal>
          ))}
        </div>

        <Reveal className="process__cta" delay={200}>
          <p>Ready to start? Share your ideas — we reply fastest on WhatsApp.</p>
          <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
            Begin Your Project
          </a>
        </Reveal>
      </div>
    </section>
  )
}
