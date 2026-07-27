import { CRAFTSMANSHIP, SITE } from '../data/site'
import './About.css'

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container about__grid">
        <div className="about__copy">
          <p className="section-eyebrow">Our Craft</p>
          <h2>Workshop Craftsmanship,<br />Modern Design</h2>
          <p>
            At Ellines Rattan Furniture, every piece begins in our Nairobi workshop — where
            skilled artisans weave premium synthetic rattan onto precision metal frames by hand.
          </p>
          <p>
            From bold black-and-white checkered patterns to warm brown weaves and geometric
            chevrons, we create furniture that is beautiful, durable, and built for Kenyan homes
            and hospitality spaces.
          </p>
          <ul className="about__list">
            <li>Premium synthetic rattan — weather-resistant &amp; long-lasting</li>
            <li>Custom sizes, colours, and weave patterns</li>
            <li>Indoor showroom pieces and outdoor-ready collections</li>
            <li>Direct workshop pricing with personal consultation</li>
          </ul>
          <img
            src="/images/logos/ellines-rattan-logo-banner.png"
            alt={SITE.name}
            className="about__banner"
            loading="lazy"
            width="480"
            height="120"
          />
        </div>

        <div className="about__gallery">
          {CRAFTSMANSHIP.map((item) => (
            <figure key={item.src} className="about__card">
              <img src={item.src} alt={item.alt} loading="lazy" />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
