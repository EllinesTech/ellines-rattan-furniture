import PageHero from '../components/PageHero'
import LegalSection from '../components/LegalSection'
import { PAGE_META } from '../data/pages'
import { SITE } from '../data/site'

const TERMS = [
  `By using ${SITE.domain}, you agree to these terms. The site is provided by Ellines Rattan Furniture for information about our custom rattan furniture and workshops in Nyeri and Nairobi.`,
  'Product images and descriptions showcase our workshop work. Colours, weaves, and finishes on custom orders may vary slightly from photos. Final specifications are confirmed in your quote before production.',
  'Quotes, lead times, and delivery costs are provided on enquiry and may change based on materials, complexity, and location. An order is confirmed only after mutual written or WhatsApp agreement and any required deposit.',
  'All website content — including photography, logos, and copy — is owned by Ellines Rattan Furniture or used with permission. You may not copy or reuse it for commercial purposes without consent.',
  `For questions about these terms, contact ${SITE.email} or call ${SITE.phones[0].display}.`,
]

export default function TermsPage() {
  const meta = PAGE_META.terms
  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <LegalSection title="Using our website & services" paragraphs={TERMS} />
    </>
  )
}
