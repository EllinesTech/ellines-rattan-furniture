import PageHero from '../components/PageHero'
import FounderProfile from '../components/FounderProfile'
import { PAGE_META } from '../data/pages'

export default function FounderPage() {
  const meta = PAGE_META.aboutFounder
  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <FounderProfile standalone />
    </>
  )
}
