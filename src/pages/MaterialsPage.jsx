import PageHero from '../components/PageHero'
import MaterialsSection from '../components/MaterialsSection'
import { PAGE_META } from '../data/pages'

export default function MaterialsPage() {
  const meta = PAGE_META.materials
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <MaterialsSection standalone />
    </>
  )
}
