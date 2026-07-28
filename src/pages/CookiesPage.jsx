import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import LegalSection from '../components/LegalSection'
import { PAGE_META } from '../data/pages'
import { SITE } from '../data/site'

const COOKIE_SECTIONS = [
  {
    heading: 'What are cookies?',
    paragraphs: [
      `Cookies and similar technologies (including local browser storage) are small files stored on your device when you visit ${SITE.domain}. They help the site remember preferences, keep features working, and — if you allow — understand how visitors use our pages.`,
    ],
  },
  {
    heading: 'Essential cookies & storage',
    paragraphs: [
      'These are required for the site to function and cannot be switched off from our banner. Examples include:',
    ],
    list: [
      'Remembering your cookie consent choice.',
      'Keeping your quote list and form progress while you browse.',
      'Maintaining a secure signed-in session if you use a client, staff, or admin account.',
      'Basic security and hosting protections (for example Cloudflare) that keep the site available.',
    ],
  },
  {
    heading: 'Optional analytics',
    paragraphs: [
      'If you choose “Accept all”, we may use limited analytics or performance measurement to understand which pages are useful and to improve the experience. If you choose “Essential only”, we will not set optional analytics cookies for that purpose.',
    ],
  },
  {
    heading: 'Customer data collection',
    paragraphs: [
      'Cookies are separate from the personal details you submit in quote forms, WhatsApp, email, or accounts. That information is handled under our Privacy Policy. We do not sell your data.',
    ],
  },
  {
    heading: 'Managing your preferences',
    paragraphs: [
      'You can change your mind at any time by clearing site data for this domain in your browser, or by using the “Cookie settings” link in the footer. You can also block cookies in your browser settings — note that essential features (quote list, login) may stop working.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      `Questions about cookies or data collection: ${SITE.email} or ${SITE.phones[0].display}.`,
    ],
  },
]

export default function CookiesPage() {
  const meta = PAGE_META.cookies
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
        title="Cookie Policy"
        updated="28 July 2026"
        sections={COOKIE_SECTIONS}
      />
      <div className="container content-page__legal-links">
        <Link to="/privacy" className="btn btn-outline">Privacy Policy</Link>
        <Link to="/terms" className="btn btn-outline">Terms of Use</Link>
      </div>
    </>
  )
}
