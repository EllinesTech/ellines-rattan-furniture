import PageHero from '../components/PageHero'
import AboutStory from '../components/AboutStory'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AboutPage() {
  const meta = usePageMeta('about')
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <AboutStory standalone />
    </>
  )
}
