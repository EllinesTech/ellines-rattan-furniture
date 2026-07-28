import PageHero from '../components/PageHero'
import FounderProfile from '../components/FounderProfile'
import { usePageMeta } from '../hooks/usePageMeta'

export default function FounderPage() {
  const meta = usePageMeta('aboutFounder')
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
