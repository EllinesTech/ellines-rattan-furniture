import PageHero from '../components/PageHero'
import CollectionsSection from '../components/CollectionsSection'
import { PAGE_META } from '../data/pages'

export default function CollectionsPage() {
  const meta = PAGE_META.collections
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
