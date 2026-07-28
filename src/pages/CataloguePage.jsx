import PageHero from '../components/PageHero'
import CatalogueSection from '../components/CatalogueSection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function CataloguePage() {
  const meta = usePageMeta('catalogue')
  return (
    <>
      <PageHero
        compact
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <CatalogueSection standalone />
    </>
  )
}
