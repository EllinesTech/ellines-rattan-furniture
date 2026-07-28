import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import VisitSection from '../components/VisitSection'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'

export default function VisitPage() {
  const meta = usePageMeta('visit')
  const waUrl = `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(
    'Hello Ellines Rattan Furniture, I would like to book a showroom visit or consultation.',
  )}`

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
            <Link to="/guide" className="btn btn-outline">
              Measurement guide
            </Link>
          </>
        }
      />
      <VisitSection standalone />
    </>
  )
}
