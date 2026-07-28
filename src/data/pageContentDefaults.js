/**
 * Default editable body content per page — seeded into Control Center CMS.
 * Super admin overrides merge on top via Firestore sitePages.
 */
import {
  ABOUT_STORY,
  ABOUT_TEAM,
  COLLECTIONS,
  HOSPITALITY,
  MATERIALS,
  FAQ_ITEMS,
  DELIVERY_INFO,
} from './content'

export const PAGE_CONTENT_DEFAULTS = {
  home: {
    intro: [],
    ctas: [
      { label: 'Shop Collection', to: '/shop', variant: 'primary' },
      { label: 'Our Services', to: '/services', variant: 'outline' },
      { label: 'WhatsApp Quote', href: 'whatsapp', variant: 'wa' },
    ],
    trust: [
      { title: 'Hand-woven', desc: 'Nyeri & Nairobi ateliers' },
      { title: 'Custom builds', desc: 'Made to your space' },
      { title: 'Nationwide', desc: 'Delivery across Kenya' },
    ],
    ctaBand: {
      heading: 'Ready for furniture that lasts?',
      sub: 'Browse the catalogue or message us on WhatsApp for a workshop quote.',
      primaryLabel: 'Shop Collection',
      primaryTo: '/shop',
      secondaryLabel: 'Request a Quote',
      secondaryTo: '/quote',
    },
  },
  about: {
    sectionEyebrow: 'Our Story',
    sectionHeading: 'The Ellines Journey',
    intro: ABOUT_STORY.intro,
    cards: ABOUT_STORY.values.map((v) => ({
      title: v.title,
      desc: v.desc,
      image: v.image,
    })),
    peopleHeading: 'Meet the people behind Ellines',
    peopleText: `From workshop artisans in Nyeri and Nairobi to ${ABOUT_STORY.founder.name}, founder of Ellines Group — discover the team and leadership behind every handcrafted piece.`,
    groupTitle: ABOUT_STORY.group.title,
    groupIntro: ABOUT_STORY.group.intro,
    quote: ABOUT_STORY.quote.text,
    quoteAuthor: ABOUT_STORY.quote.author,
  },
  aboutTeam: {
    intro: [ABOUT_TEAM.intro],
    cards: ABOUT_TEAM.members.map((m) => ({
      title: m.title,
      desc: `${m.location} — ${m.desc}`,
      image: m.image,
    })),
    ctaBand: {
      heading: ABOUT_TEAM.cta,
      sub: '',
      primaryLabel: 'Contact us',
      primaryTo: '/contact',
      secondaryLabel: 'Visit founder',
      secondaryTo: '/about/founder',
    },
  },
  aboutFounder: {
    intro: ABOUT_STORY.founder.paragraphs,
    cards: [
      {
        title: ABOUT_STORY.founder.name,
        desc: ABOUT_STORY.founder.role,
        image: ABOUT_STORY.founder.image,
      },
    ],
  },
  collections: {
    sectionEyebrow: 'Browse',
    sectionHeading: 'Our Collections',
    sectionSub: 'Explore categories — every piece can be customised to your space.',
    cards: COLLECTIONS.map((c) => ({
      title: c.name,
      desc: c.desc,
      image: c.image,
      category: c.category,
    })),
  },
  hospitality: {
    intro: [HOSPITALITY.intro],
    cards: HOSPITALITY.audiences.map((a) => ({
      title: a.title,
      desc: a.desc,
      image: a.image,
    })),
    bullets: HOSPITALITY.benefits,
  },
  materials: {
    cards: MATERIALS.map((m) => ({
      title: m.title,
      desc: m.desc,
      care: m.care,
      image: m.image,
    })),
  },
  faq: {
    faq: FAQ_ITEMS.map((f) => ({ q: f.q, a: f.a })),
  },
  delivery: {
    cards: DELIVERY_INFO.steps.map((s) => ({
      title: s.title,
      desc: s.desc,
      image: '',
    })),
    warranty: DELIVERY_INFO.warranty.map((w) => ({
      title: w.title,
      desc: w.desc,
    })),
  },
  craftsmanship: {
    intro: [
      'Every Ellines piece begins as a frame and a length of premium synthetic rattan — finished by hand in our Nyeri and Nairobi workshops.',
      'We weave checkered, chevron, and solid patterns onto steel, wood, or aluminium frames, or materials you recommend, so each build matches your space and climate.',
    ],
    bullets: [
      'Hand-woven synthetic rattan for indoor and outdoor use',
      'Frames in steel, wood, aluminium, or client-specified materials',
      'Custom sizes, colours, and weave patterns',
      'Workshop QC before every delivery',
    ],
    cards: [
      {
        title: 'Nyeri Atelier',
        desc: 'Production weaving and frame builds.',
        image: '/images/projects/project-craftsmanship-weaving.jpg',
      },
      {
        title: 'Nairobi Showroom',
        desc: 'Consultations, samples, and project planning.',
        image: '/images/projects/workshop-nairobi-showroom.jpg',
      },
    ],
  },
  services: {
    intro: [
      'From a single armchair to a full hospitality lounge — we design, weave, repair, and advise with transparent starting prices.',
    ],
    ctaBand: {
      heading: 'Need a custom build or repair?',
      sub: 'Request a service quote or message us on WhatsApp.',
      primaryLabel: 'Request a Quote',
      primaryTo: '/quote',
      secondaryLabel: 'Contact',
      secondaryTo: '/contact',
    },
  },
  shop: {
    intro: [
      'Browse workshop pieces — add to your quote list for a personalised estimate from our atelier.',
    ],
    trust: [
      { title: 'Workshop-made', desc: 'Hand-woven in Nyeri & Nairobi' },
      { title: 'Custom quotes', desc: 'Tailored to your space & budget' },
      { title: 'Nationwide delivery', desc: 'Careful delivery across Kenya' },
    ],
  },
  contact: {
    intro: [
      'Visit our workshops or message us — we deliver across Kenya.',
    ],
  },
  projects: {
    intro: [
      'Real furniture built to order — explore our workshop portfolio.',
    ],
  },
  quote: {
    intro: [
      'Review your selections, share your details, and request a workshop estimate.',
    ],
  },
  privacy: { intro: [], bodyHtml: '' },
  terms: { intro: [], bodyHtml: '' },
  cookies: { intro: [], bodyHtml: '' },
}

export function getDefaultPageContent(key) {
  return PAGE_CONTENT_DEFAULTS[key] || {}
}
