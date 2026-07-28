import PageHero from '../components/PageHero'
import HospitalitySection from '../components/HospitalitySection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function HospitalityPage() {
  const meta = usePageMeta('hospitality')
  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <HospitalitySection standalone />
    </>
  )
}
