import PageHero from '../components/PageHero'
import TeamSection from '../components/TeamSection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function TeamPage() {
  const meta = usePageMeta('aboutTeam')
  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <TeamSection standalone />
    </>
  )
}
