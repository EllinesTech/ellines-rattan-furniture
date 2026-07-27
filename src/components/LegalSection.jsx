import Reveal from './Reveal'
import './ContentPages.css'

export default function LegalSection({ title, paragraphs }) {
  return (
    <section className="section content-page content-page--standalone">
      <div className="container">
        <Reveal className="legal-doc card">
          <h2 className="legal-doc__title">{title}</h2>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
