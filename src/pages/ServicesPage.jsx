import PageHero from '../components/PageHero'
import Services from '../components/Services'
import Testimonials from '../components/Testimonials'
import { PAGE_META } from '../data/pages'

export default function ServicesPage() {
  const meta = PAGE_META.services

  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <Services standalone />
      <Testimonials />
    </>
  )
}
