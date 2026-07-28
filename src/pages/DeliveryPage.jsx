import PageHero from '../components/PageHero'
import DeliverySection from '../components/DeliverySection'
import { usePageMeta } from '../hooks/usePageMeta'

export default function DeliveryPage() {
  const meta = usePageMeta('delivery')
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <DeliverySection standalone />
    </>
  )
}
