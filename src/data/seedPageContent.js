/** Defaults for site_data/rattan_page_content — brochure, calendly, financing, trade. */
export const DEFAULT_PAGE_CONTENT = {
  brochurePdfUrl: '',
  calendlyUrl: '',
  financing: {
    eyebrow: 'Payment & Financing',
    heading: 'Workshop-friendly payments',
    intro: [
      'Custom furniture is a planned purchase. We keep payment simple for Kenyan homes and hospitality projects — clear deposits, staged milestones, and M-Pesa-friendly settlement where agreed.',
      'Final terms are confirmed on your written quote. Below is how most private and trade orders work.',
    ],
    sections: [
      {
        title: 'Deposit to start weaving',
        body: 'A deposit secures materials and workshop time. Typical private builds start once the deposit clears — amount confirmed on your quote.',
      },
      {
        title: 'Staged payments',
        body: 'Larger sofas, living sets, and hospitality runs can be split: deposit → mid-build milestone → balance before delivery. We share progress photos so you know where your order stands.',
      },
      {
        title: 'M-Pesa & bank transfer',
        body: 'We accept M-Pesa and bank transfer for deposits and balances when arranged with the workshop. Always use the payment details on your official quote or invoice.',
      },
      {
        title: 'What we do not offer',
        body: 'We are a workshop, not a bank. We do not run third-party loan products. If you need longer financing, talk to your bank or Sacco — we can time deposits and delivery around your plan.',
      },
    ],
    note: 'Questions about a specific budget? Request a quote or book a visit — we will map a payment plan to your build timeline.',
    ctaLabel: 'Request a quote',
    ctaTo: '/quote',
    secondaryLabel: 'Book a visit',
    secondaryTo: '/visit',
  },
  trade: {
    formIntro:
      'Tell us about your project — designers, architects, and hospitality buyers can request sample weaves, drawings, and trade pricing.',
    sampleNoteLabel: 'Samples / drawings needed',
    sampleNotePlaceholder:
      'e.g. Weave colour samples, CAD footprints for modular sofa, finish board…',
  },
}

export const BOOKING_STATUSES = ['new', 'confirmed', 'completed', 'cancelled']

export const BOOKING_STATUS_LABELS = {
  new: 'New',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const TRADE_STATUSES = ['new', 'reviewing', 'quoted', 'won', 'lost']

export const TRADE_STATUS_LABELS = {
  new: 'New',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}

export const VISIT_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]
