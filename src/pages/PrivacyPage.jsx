import PageHero from '../components/PageHero'
import LegalSection from '../components/LegalSection'
import { PAGE_META } from '../data/pages'
import { SITE } from '../data/site'

const PRIVACY = [
  `Ellines Rattan Furniture (“we”, “us”) respects your privacy. This policy explains how we handle information when you use ${SITE.domain} or contact us.`,
  'When you message us via WhatsApp, phone, or email, we collect the details you share — such as your name, contact number, email, and project requirements — solely to respond to your enquiry and fulfil custom furniture orders.',
  'We do not sell your personal information. We may share details with our Nyeri and Nairobi workshop teams as needed to prepare quotes, designs, and deliveries.',
  'Our website may use basic analytics or hosting logs (for example via Cloudflare) to understand traffic and keep the site secure. These typically include IP address, browser type, and pages visited.',
  `To update or remove your contact details from our records, email ${SITE.email} or message us on WhatsApp.`,
  'This policy may be updated from time to time. The latest version will always be available on this page.',
]

export default function PrivacyPage() {
  const meta = PAGE_META.privacy
  return (
    <>
      <PageHero
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />
      <LegalSection title="How we handle your information" paragraphs={PRIVACY} />
    </>
  )
}
