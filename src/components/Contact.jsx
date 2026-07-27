import { SITE } from '../data/site'
import './Contact.css'

export default function Contact() {
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <section id="contact" className="section contact">
      <div className="container contact__grid">
        <div className="contact__copy">
          <p className="section-eyebrow">Get in Touch</p>
          <h2>Start Your Custom Project</h2>
          <p>
            Share your space dimensions, preferred colours, or reference photos — we will
            guide you from design to delivery across Kenya.
          </p>

          <div className="contact__cards">
            <a href={waUrl} className="contact__card contact__card--wa" target="_blank" rel="noopener noreferrer">
              <span className="contact__card-label">WhatsApp</span>
              <strong>Chat with us</strong>
              <span>Fastest response</span>
            </a>
            {SITE.phones.map((phone) => (
              <a key={phone.tel} href={`tel:${phone.tel}`} className="contact__card">
                <span className="contact__card-label">Phone</span>
                <strong>{phone.display}</strong>
                <span>Call or text</span>
              </a>
            ))}
            <a href={`mailto:${SITE.email}`} className="contact__card">
              <span className="contact__card-label">Email</span>
              <strong>{SITE.email}</strong>
              <span>Project enquiries</span>
            </a>
            <div className="contact__card contact__card--static">
              <span className="contact__card-label">Location</span>
              <strong>{SITE.location}</strong>
              <span>{SITE.hours}</span>
            </div>
          </div>

          <a href={waUrl} className="btn btn-primary btn-wa contact__cta" target="_blank" rel="noopener noreferrer">
            Message on WhatsApp
          </a>
        </div>

        <div className="contact__visual card">
          <img
            src="/images/projects/modular-sofa-collection-white-brown-grey-outdoor.jpg"
            alt="Outdoor modular rattan sofa collection"
            loading="lazy"
          />
          <div className="contact__visual-caption">
            <img
              src="/images/logos/ellines-rattan-logo-square.png"
              alt=""
              width="72"
              height="72"
              loading="lazy"
            />
            <p>
              <em>Crafted Designs with Beauty</em>
              <span>— Ellines Rattan Furniture</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
