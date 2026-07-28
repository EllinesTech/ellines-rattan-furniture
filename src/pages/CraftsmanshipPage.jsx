import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import About from '../components/About'
import Process from '../components/Process'
import { usePageMeta } from '../hooks/usePageMeta'

export default function CraftsmanshipPage() {
  const meta = usePageMeta('craftsmanship')

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
            <Link to="/projects" className="btn btn-primary">
              See Projects
            </Link>
            <Link to="/shop" className="btn btn-outline">
              Shop Pieces
            </Link>
          </>
        }
      />
      <About standalone />
      <Process />
    </>
  )
}
