import { useState } from 'react'
import { FAQ_ITEMS } from '../data/content'
import { SITE } from '../data/site'
import Reveal from './Reveal'
import './ContentPages.css'

export default function FaqSection({ standalone = false }) {
  const [open, setOpen] = useState(0)
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section className={`section content-page ${standalone ? 'content-page--standalone' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="section-head section-head--center">
            <p className="section-eyebrow">Questions</p>
            <h2>Frequently Asked Questions</h2>
          </Reveal>
        )}

        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <article className={`faq-item card ${open === i ? 'faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="faq-item__trigger"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-item__icon" aria-hidden="true">{open === i ? '−' : '+'}</span>
                </button>
                {open === i && (
                  <div className="faq-item__answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="content-page__cta card" delay={150}>
          <p>Still have questions? We are happy to help.</p>
          <a href={waUrl} className="btn btn-primary btn-wa" target="_blank" rel="noopener noreferrer">
            Ask on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  )
}
