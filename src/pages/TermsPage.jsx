import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import LegalSection from '../components/LegalSection'
import { PAGE_META } from '../data/pages'
import { SITE } from '../data/site'

const TERMS_SECTIONS = [
  {
    heading: 'Agreement to these terms',
    paragraphs: [
      `By accessing ${SITE.domain} or requesting a quote from Ellines Rattan Furniture, you agree to these Terms of Use. If you do not agree, please do not use the site. Ellines Rattan Furniture is a brand of Ellines Group, based in Nyeri and Nairobi, Kenya.`,
    ],
  },
  {
    heading: 'Our services',
    paragraphs: [
      'We design and handcraft synthetic rattan furniture — including living sets, sofas, armchairs, cabinets, tables, and outdoor seating — for homes, hospitality venues, and trade clients across Kenya. Website content is for information and enquiry; it does not guarantee stock availability of every displayed piece.',
    ],
  },
  {
    heading: 'Quotes, orders & payments',
    paragraphs: [
      'Catalogue prices (where shown) are starting guides only. Final quotes depend on size, weave, finish, cushions, and delivery location. An order is confirmed only after mutual written or WhatsApp agreement and any required deposit. Lead times and delivery costs are confirmed at quote stage and may change if project scope changes.',
    ],
  },
  {
    heading: 'Product appearance',
    paragraphs: [
      'Photographs and descriptions showcase our workshop work. Colours, weaves, and finishes on custom orders may vary slightly from photos due to materials and handcraft. Final specifications are confirmed in your quote before production begins.',
    ],
  },
  {
    heading: 'Accounts & quote tools',
    paragraphs: [
      'If you create an account or use the quote list, you are responsible for keeping your login details secure and for activity under your account. You must provide accurate contact information so we can fulfil your enquiry.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'All website content — including photography, logos, product designs, and copy — is owned by Ellines Rattan Furniture / Ellines Group or used with permission. You may not copy, scrape, or reuse it for commercial purposes without prior written consent.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      'You agree not to misuse the site — including attempting to disrupt security, submit malicious content, harvest data, or use our contact channels for spam or unlawful purposes.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'We take care to keep information accurate, but the site is provided “as is”. To the fullest extent permitted by Kenyan law, Ellines Rattan Furniture is not liable for indirect or consequential losses arising from use of the website. Workshop warranties for furniture are described on our Delivery & Warranty page and in your order confirmation.',
    ],
  },
  {
    heading: 'Privacy & cookies',
    paragraphs: [
      'How we collect and use personal data is described in our Privacy Policy. Cookie preferences are explained in our Cookie Policy. By using the site you acknowledge those practices, subject to choices you make in the cookie banner.',
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of Kenya. Disputes will first be addressed in good faith; unresolved matters may be referred to the competent courts of Kenya.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      `Questions about these terms: ${SITE.email} · ${SITE.phones[0].display} · ${SITE.location}.`,
    ],
  },
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
      <LegalSection
        title="Terms of Use"
        updated="28 July 2026"
        sections={TERMS_SECTIONS}
      />
      <div className="container content-page__legal-links">
        <Link to="/privacy" className="btn btn-outline">Privacy Policy</Link>
        <Link to="/cookies" className="btn btn-outline">Cookie Policy</Link>
      </div>
    </>
  )
}
