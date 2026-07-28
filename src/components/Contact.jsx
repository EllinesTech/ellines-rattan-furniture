import { CONTACT_IMAGE, SITE, WHY_CHOOSE } from '../data/site'
import OptimizedImage from './OptimizedImage'
import Reveal from './Reveal'
import './Contact.css'

export default function Contact({ standalone = false }) {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section id={standalone ? undefined : 'contact'} className={`section contact ${standalone ? 'contact--page' : ''}`}>
      <div className="container">
        {!standalone && (
          <Reveal className="contact__header section-head section-head--center">
            <p className="section-eyebrow">Get in Touch</p>
            <h2>Start Your Custom Project</h2>
            <p>
              Visit our Nairobi showroom or connect with our Nyeri workshop team.
              Share dimensions, colours, or reference photos — we deliver across Kenya.
            </p>
          </Reveal>
        )}

        <div className="contact__trust">
          {WHY_CHOOSE.map((item, i) => (
            <Reveal key={item.title} className="contact__trust-item" delay={i * 60}>
              <span className="contact__trust-mark" aria-hidden="true">✦</span>
              <span>{item.title}</span>
            </Reveal>
          ))}
        </div>

        <div className="contact__grid">
          <Reveal className="contact__copy">
            <div className="contact__workshops">
              {SITE.workshops.map((w) => (
                <div key={w.city} className="contact__workshop card">
                  {w.image && (
                    <div className="contact__workshop-img">
                      <OptimizedImage src={w.image} alt={`${w.label} — Ellines Rattan Furniture`} loading="lazy" useThumb thumbWidth={640} />
                    </div>
                  )}
                  <div className="contact__workshop-body">
                    <span className="contact__workshop-badge">{w.city}</span>
                    <h3>{w.label}</h3>
                    <p>{w.description}</p>
                    <span className="contact__workshop-hours">{SITE.hours}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact__cards">
              <a href={waUrl} className="contact__card contact__card--wa" target="_blank" rel="noopener noreferrer">
                <span className="contact__card-icon" aria-hidden="true">💬</span>
                <span className="contact__card-label">WhatsApp</span>
                <strong>Chat with us</strong>
                <span>Fastest response — Nyeri &amp; Nairobi</span>
              </a>
              {SITE.phones.map((phone) => (
                <a key={phone.tel} href={`tel:${phone.tel}`} className="contact__card">
                  <span className="contact__card-icon" aria-hidden="true">📞</span>
                  <span className="contact__card-label">Phone</span>
                  <strong>{phone.display}</strong>
                  <span>Call or text</span>
                </a>
              ))}
              <a href={`mailto:${SITE.email}`} className="contact__card">
                <span className="contact__card-icon" aria-hidden="true">✉</span>
                <span className="contact__card-label">Email</span>
                <strong>{SITE.email}</strong>
                <span>Project enquiries</span>
              </a>
            </div>

            <div className="contact__social" aria-label="Follow Ellines Rattan Furniture">
              <p className="contact__social-label">Follow us</p>
              <div className="contact__social-links">
                {SITE.social.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="contact__social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <strong>{item.label}</strong>
                    <span>{item.handle}</span>
                  </a>
                ))}
              </div>
            </div>

            <a href={waUrl} className="btn btn-primary btn-wa contact__cta" target="_blank" rel="noopener noreferrer">
              Message on WhatsApp
            </a>
          </Reveal>

          <Reveal className="contact__visual card reveal--right" delay={120}>
            <div className="contact__visual-frame">
              <OptimizedImage src={CONTACT_IMAGE.src} alt={CONTACT_IMAGE.alt} loading="lazy" useThumb thumbWidth={960} />
            </div>
            <div className="contact__visual-caption">
              <img
                src="/images/logos/ellines-rattan-logo-square.png"
                alt=""
                width="1343"
                height="1171"
                loading="lazy"
              />
              <p>
                <em>Crafted Designs with Beauty</em>
                <span>— Nyeri &amp; Nairobi, Kenya</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
