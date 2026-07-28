import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import LegalSection from '../components/LegalSection'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'

const PRIVACY_SECTIONS = [
  {
    heading: 'Who we are',
    paragraphs: [
      `Ellines Rattan Furniture (“we”, “us”) is the furniture brand of Ellines Group, operating workshops in Nyeri and Nairobi, Kenya. This policy explains how we handle personal information when you use ${SITE.domain}, request a quote, create an account, or contact us.`,
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'We collect information you choose to share with us, and limited technical data needed to run the website securely.',
    ],
    list: [
      'Identity & contact details — name, phone / WhatsApp number, email address, and delivery or project location.',
      'Project details — furniture preferences, dimensions, photos, sketches, and notes you send for a custom quote.',
      'Account details — if you sign in to a client account, we store login credentials and profile information you provide.',
      'Quote & order records — items added to a quote list, request history, and communication related to your enquiry.',
      'Technical data — IP address, browser type, device information, and pages visited, typically via hosting or security logs (for example Cloudflare).',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: ['We use personal data only for legitimate business purposes connected to our furniture services:'],
    list: [
      'Responding to enquiries and preparing workshop quotes.',
      'Designing, producing, delivering, and supporting custom furniture orders.',
      'Managing client or staff accounts where you have registered access.',
      'Improving website security, performance, and visitor experience.',
      'Sending updates you request about your order or quote — not unsolicited marketing unless you ask us to stay in touch.',
    ],
  },
  {
    heading: 'Cookies & similar technologies',
    paragraphs: [
      'We use essential cookies and local browser storage so the site works (for example remembering cookie preferences and quote-list selections). Optional analytics cookies are used only if you accept them. See our Cookie Policy for full details and choices.',
    ],
  },
  {
    heading: 'How we share information',
    paragraphs: [
      'We do not sell your personal information. We may share details only as needed with:',
    ],
    list: [
      'Our Nyeri and Nairobi workshop teams — to prepare designs, quotes, production, and delivery.',
      'Trusted service providers — such as hosting, database, or messaging platforms that help us operate the site (for example Firebase when configured).',
      'Ellines Group companies — only where necessary to support shared operations (for example IT or account systems), under the same privacy standards.',
      'Authorities — if required by Kenyan law or to protect our legal rights.',
    ],
  },
  {
    heading: 'Data retention & security',
    paragraphs: [
      'We keep enquiry and order records for as long as needed to fulfil your request, provide aftercare, and meet legal or accounting requirements. Technical logs are kept for a shorter period for security. We use reasonable technical and organisational measures to protect your data; no online transmission is completely risk-free.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: [
      `You may request access to, correction of, or deletion of your personal data, or ask us to stop using it for marketing. Contact ${SITE.email}, call ${SITE.phones[0].display}, or message us on WhatsApp. We will respond within a reasonable time.`,
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'Our website and services are intended for adults making furniture enquiries. We do not knowingly collect personal data from children.',
    ],
  },
  {
    heading: 'Policy updates',
    paragraphs: [
      'We may update this policy from time to time. The latest version will always be available on this page with an updated date.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      `Questions about privacy or data collection: ${SITE.email} · ${SITE.phones[0].display} · ${SITE.location}.`,
    ],
  },
]

export default function PrivacyPage() {
  const meta = usePageMeta('privacy')
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
        title="Privacy Policy"
        updated="28 July 2026"
        sections={PRIVACY_SECTIONS}
      />
      <div className="container content-page__legal-links">
        <Link to="/cookies" className="btn btn-outline">Cookie Policy</Link>
        <Link to="/terms" className="btn btn-outline">Terms of Use</Link>
      </div>
    </>
  )
}
