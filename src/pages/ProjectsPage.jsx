import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Gallery from '../components/Gallery'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProjectsPage() {
  const meta = usePageMeta('projects')

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
            <Link to="/shop" className="btn btn-primary">
              Shop Collection
            </Link>
            <Link to="/craftsmanship" className="btn btn-outline">
              Our Craft
            </Link>
          </>
        }
      />
      <Gallery standalone />
    </>
  )
}
