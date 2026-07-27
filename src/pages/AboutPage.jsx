import PageHero from '../components/PageHero'
import AboutStory from '../components/AboutStory'
import { PAGE_META } from '../data/pages'

export default function AboutPage() {
  const meta = PAGE_META.about
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <AboutStory standalone />
    </>
  )
}
