import PageHero from '../components/PageHero'
import MeasureGuideSection from '../components/MeasureGuideSection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function GuidePage() {
  const meta = usePageMeta('guide')
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
      <MeasureGuideSection standalone />
    </>
  )
}
