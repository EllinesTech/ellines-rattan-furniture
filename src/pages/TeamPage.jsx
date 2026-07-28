import PageHero from '../components/PageHero'
import TeamSection from '../components/TeamSection'
import { PAGE_META } from '../data/pages'

export default function TeamPage() {
  const meta = PAGE_META.aboutTeam
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
