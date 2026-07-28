import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Services from '../components/Services'
import Testimonials from '../components/Testimonials'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'

export default function ServicesPage() {
  const meta = usePageMeta('services')
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
        actions={
          <>
            <Link to="/shop" className="btn btn-primary">
              Browse Shop
            </Link>
            <Link to="/quote" className="btn btn-outline">
              Request Quote
            </Link>
            <a href={waUrl} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </>
        }
      />
      <Services standalone />
      <Testimonials />
    </>
  )
}
