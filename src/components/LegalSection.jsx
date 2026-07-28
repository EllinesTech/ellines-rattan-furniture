import Reveal from './Reveal'
import './ContentPages.css'

export default function LegalSection({ title, paragraphs = [], sections = [], updated }) {
  const blocks = sections.length
    ? sections
    : paragraphs.length
      ? [{ heading: null, paragraphs }]
      : []

  return (
    <section className="section content-page content-page--standalone">
      <div className="container">
        <Reveal className="legal-doc card">
          <h2 className="legal-doc__title">{title}</h2>
          {updated && <p className="legal-doc__updated">Last updated: {updated}</p>}
          {blocks.map((block) => (
            <div key={block.heading || 'intro'} className="legal-doc__section">
              {block.heading && <h3 className="legal-doc__heading">{block.heading}</h3>}
              {block.paragraphs.map((p) => (
                <p key={p.slice(0, 64)}>{p}</p>
              ))}
              {block.list && (
                <ul className="legal-doc__list">
                  {block.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
