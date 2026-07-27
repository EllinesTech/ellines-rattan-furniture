import PageHero from '../components/PageHero'
import DeliverySection from '../components/DeliverySection'
import { PAGE_META } from '../data/pages'

export default function DeliveryPage() {
  const meta = PAGE_META.delivery
  return (
    <>
      <PageHero eyebrow={meta.eyebrow} title={meta.heading} subtitle={meta.sub} image={meta.heroImage} position={meta.heroPosition} />
      <DeliverySection standalone />
    </>
  )
}
