import PageHero from '../components/PageHero'
import About from '../components/About'
import Process from '../components/Process'
import { PAGE_META } from '../data/pages'

export default function CraftsmanshipPage() {
  const meta = PAGE_META.craftsmanship

  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <About standalone />
      <Process />
    </>
  )
}
