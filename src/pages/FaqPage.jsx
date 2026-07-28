import PageHero from '../components/PageHero'
import FaqSection from '../components/FaqSection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function FaqPage() {
  const meta = usePageMeta('faq')
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <FaqSection standalone />
    </>
  )
}
