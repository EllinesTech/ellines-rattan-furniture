import PageHero from '../components/PageHero'
import HospitalitySection from '../components/HospitalitySection'
import { PAGE_META } from '../data/pages'

export default function HospitalityPage() {
  const meta = PAGE_META.hospitality
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
