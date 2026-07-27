import PageHero from '../components/PageHero'
import Gallery from '../components/Gallery'
import { PAGE_META } from '../data/pages'

export default function ProjectsPage() {
  const meta = PAGE_META.projects

  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <Gallery standalone />
    </>
  )
}
