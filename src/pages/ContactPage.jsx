import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Contact from '../components/Contact'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'

export default function ContactPage() {
  const meta = usePageMeta('contact')
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(SITE.whatsapp.message)}`

  return (
    <>
      <PageHero
        compact
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
        actions={
          <>
            <a href={waUrl} className="btn btn-wa" target="_blank" rel="noopener noreferrer">
              WhatsApp Us
            </a>
            <a href={`tel:${SITE.phones[0].tel}`} className="btn btn-primary">
              Call {SITE.phones[0].display}
            </a>
            <Link to="/quote" className="btn btn-outline">
              Get a Quote
            </Link>
          </>
        }
      />
      <Contact standalone />
    </>
  )
}
