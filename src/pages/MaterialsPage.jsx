import PageHero from '../components/PageHero'
import MaterialsSection from '../components/MaterialsSection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function MaterialsPage() {
  const meta = usePageMeta('materials')
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <MaterialsSection standalone />
    </>
  )
}
