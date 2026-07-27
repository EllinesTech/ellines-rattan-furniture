import PageHero from '../components/PageHero'
import Contact from '../components/Contact'
import { PAGE_META } from '../data/pages'

export default function ContactPage() {
  const meta = PAGE_META.contact

  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <Contact standalone />
    </>
  )
}
