import PageHero from '../components/PageHero'
import CollectionsSection from '../components/CollectionsSection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function CollectionsPage() {
  const meta = usePageMeta('collections')
  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <CollectionsSection standalone />
    </>
  )
}
