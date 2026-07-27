import PageHero from '../components/PageHero'
import FaqSection from '../components/FaqSection'
import { PAGE_META } from '../data/pages'

export default function FaqPage() {
  const meta = PAGE_META.faq
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <FaqSection standalone />
    </>
  )
}
