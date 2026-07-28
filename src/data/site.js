export const SITE = {
  name: 'Ellines Rattan Furniture',
  tagline: 'Crafted Designs with Beauty',
  domain: 'https://rattanfurniture.ellines.co.ke',
  description:
    'Handcrafted synthetic rattan furniture in Kenya. Custom sofas, armchairs, cabinets, tables, and outdoor sets — workshop craftsmanship with modern designs.',
  email: 'info@ellines.co.ke',
  phones: [
    { display: '0748 255 466', tel: '+254748255466' },
    { display: '0728 807 213', tel: '+254728807213' },
  ],
  whatsapp: {
    number: '254748255466',
    message:
      'Hello Ellines Rattan Furniture, I would like to enquire about custom rattan furniture.',
  },
  location: 'Nyeri & Nairobi, Kenya',
  hours: 'Mon – Sat, 8:00 AM – 6:00 PM',
  group: {
    name: 'Ellines Group',
    founder: 'Elijah Mwangi M',
  },
  workshops: [
    {
      city: 'Nairobi',
      label: 'Nairobi Workshop',
      description: 'Showroom, consultations, and custom builds',
      image: '/images/projects/project-original-living-set-wide.jpg',
    },
    {
      city: 'Nyeri',
      label: 'Nyeri Workshop',
      description: 'Production and hand-weaving atelier',
      image: '/images/projects/project-craftsmanship-overhead.jpg',
    },
  ],
}

export const NAV_LINKS = [
  { path: '/', label: 'Home', id: 'home', end: true },
  { path: '/services', label: 'Services', id: 'services' },
  { path: '/shop', label: 'Shop', id: 'shop' },
  { path: '/craftsmanship', label: 'Craftsmanship', id: 'craftsmanship' },
  { path: '/projects', label: 'Projects', id: 'projects' },
  { path: '/contact', label: 'Contact', id: 'contact' },
]

export const ABOUT_DROPDOWN = {
  label: 'About Us',
  path: '/about',
  id: 'about',
  items: [
    { path: '/about/team', label: 'The Team' },
    { path: '/about/founder', label: 'The Founder' },
  ],
}

export const HERO_IMAGE = {
  src: '/images/projects/project-original-living-set-wide.jpg',
  position: 'center 45%',
  alt: 'Brown and grey synthetic rattan living set — handcrafted by Ellines Rattan Furniture',
}

export const HERO_TRUST = [
  { title: 'Two Workshops', desc: 'Nyeri & Nairobi' },
  { title: 'Custom Designs', desc: 'Made to your space' },
  { title: 'Premium Rattan', desc: 'Weather-resistant weave' },
]

export const ABOUT_STATS = [
  { value: '2', label: 'Workshops in Kenya', count: 2, suffix: '' },
  { value: '100%', label: 'Hand-woven', count: 100, suffix: '%' },
  { value: '18+', label: 'Project styles', count: 18, suffix: '+' },
]

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Consult & Measure',
    description:
      'Share your space dimensions, style references, or a sketch. We advise on weave patterns, colours, and frame options — steel, wood, aluminium, or materials you prefer.',
    image: '/images/projects/project-original-living-set-brown.jpg',
  },
  {
    step: '02',
    title: 'Design & Quote',
    description:
      'Our Nairobi team prepares a custom design and transparent workshop quote — no hidden costs, direct from the atelier.',
    image: '/images/projects/project-original-modular-grey-white.jpg',
  },
  {
    step: '03',
    title: 'Hand-Weave & Build',
    description:
      'Skilled artisans in Nyeri weave premium synthetic rattan onto frames in steel, wood, aluminium, or other client-recommended materials — stripe by stripe, piece by piece.',
    image: '/images/projects/project-craftsmanship-weaving.jpg',
  },
  {
    step: '04',
    title: 'Deliver & Install',
    description:
      'Finished furniture delivered across Kenya with care. We stand behind every build with workshop-direct support.',
    image: '/images/projects/project-original-modular-collection.jpg',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'The living set exceeded our expectations — the checkered weave is flawless and it has held up beautifully on our terrace.',
    name: 'Grace M.',
    role: 'Homeowner, Nairobi',
    rating: 5,
  },
  {
    quote:
      'We ordered modular sofas for our restaurant patio. Ellines understood our brief perfectly and delivered on time.',
    name: 'James K.',
    role: 'Hospitality, Westlands',
    rating: 5,
  },
  {
    quote:
      'From WhatsApp enquiry to delivery — the whole process felt personal. You can tell every piece is made by hand.',
    name: 'Faith W.',
    role: 'Interior client, Nyeri',
    rating: 5,
  },
  {
    quote:
      'Custom armchairs for our lounge — the black and white weave is a conversation starter. Craftsmanship at its finest.',
    name: 'David O.',
    role: 'Boutique hotel, Karen',
    rating: 5,
  },
]

export const WHY_CHOOSE = [
  { title: 'Workshop-direct pricing', desc: 'No middlemen — buy straight from our Nyeri & Nairobi ateliers' },
  { title: 'Weather-resistant rattan', desc: 'Premium synthetic weave built for Kenyan sun and rain' },
  { title: 'Fully custom builds', desc: 'Any size, colour, or pattern — your space, your design' },
  { title: 'Repair & consultation', desc: 'Reasonable-price repairs, plus paid furniture consultation' },
]

export const FEATURED_SHOWCASE = [
  {
    src: '/images/projects/project-original-living-set-wide.jpg',
    title: 'Living Sets',
    category: 'Living Sets',
  },
  {
    src: '/images/projects/project-original-armchair-shaggy.jpg',
    title: 'Woven Armchair',
    category: 'Armchairs',
  },
  {
    src: '/images/projects/project-original-cabinet-gold.jpg',
    title: 'Checkered Cabinet',
    category: 'Cabinets',
  },
  {
    src: '/images/projects/project-original-modular-sections.jpg',
    title: 'Modular Sofas',
    category: 'Sofas',
  },
]

export const SERVICES = [
  {
    title: 'Custom Sofas & Sectionals',
    description:
      'Modular and fixed sofas tailored to your space, weave pattern, and colour palette — built for comfort indoors or out.',
    icon: 'sofa',
    image: '/images/projects/project-original-modular-sections.jpg',
    pricing: { type: 'from', amount: 145000 },
  },
  {
    title: 'Armchairs & Lounge Seating',
    description:
      'Statement armchairs with hand-woven synthetic rattan on sturdy steel, wood, or aluminium frames — elegant, durable, and made to order.',
    icon: 'chair',
    image: '/images/projects/project-original-armchair-shaggy.jpg',
    pricing: { type: 'from', amount: 65000 },
  },
  {
    title: 'Cabinets & Storage',
    description:
      'Checkered and geometric woven cabinets with glass tops, gold accents, and practical shelving for home or hospitality.',
    icon: 'cabinet',
    image: '/images/projects/project-original-cabinet-gold.jpg',
    pricing: { type: 'from', amount: 55000 },
  },
  {
    title: 'Tables & Side Pieces',
    description:
      'Coffee tables, side tables, and accent pieces that complement your seating — coordinated weaves and finishes.',
    icon: 'table',
    image: '/images/projects/project-original-coffee-table.jpg',
    pricing: { type: 'from', amount: 35000 },
  },
  {
    title: 'Outdoor Living Sets',
    description:
      'Weather-resistant rattan collections for patios, terraces, and poolside lounges — designed for Kenyan climates.',
    icon: 'outdoor',
    image: '/images/projects/project-original-modular-collection.jpg',
    pricing: { type: 'from', amount: 185000 },
  },
  {
    title: 'Bespoke Workshop Builds',
    description:
      'Bring your reference or sketch. Our Nyeri and Nairobi workshops weave every piece by hand with precision and care.',
    icon: 'craft',
    image: '/images/projects/project-craftsmanship-weaving.jpg',
    pricing: { type: 'quote' },
  },
  {
    title: 'Rattan Furniture Repair',
    description:
      'We repair and re-weave rattan furniture at a reasonable price — loose weaves, damaged sections, frame touch-ups, and refreshes for pieces you already love.',
    icon: 'repair',
    image: '/images/projects/project-craftsmanship-hand-weave.jpg',
    pricing: { type: 'from', amount: 8500, note: 'Per item · quote after photos' },
  },
  {
    title: 'Furniture Consultation',
    description:
      'Paid consultation for layout, weave selection, frame materials, and project planning — workshop advice tailored to your space, budget, and style.',
    icon: 'consult',
    image: '/images/projects/workshop-nairobi-showroom.jpg',
    pricing: { type: 'fee', amount: 3500, note: 'Per session (approx. 1 hour)' },
  },
]

export const SERVICE_PRICING = {
  note:
    'Prices below are starting guides from our workshop. Final quotes depend on size, weave, frame material, cushions, repair scope, and delivery location.',
  deliveryNote: 'Nationwide delivery quoted separately based on location and piece size.',
  tiers: [
    {
      group: 'Custom furniture',
      items: [
        { name: 'Living sets', price: 185000, type: 'from' },
        { name: 'Sofas & sectionals', price: 145000, type: 'from' },
        { name: 'Armchairs', price: 65000, type: 'from' },
        { name: 'Cabinets & storage', price: 55000, type: 'from' },
        { name: 'Tables & side pieces', price: 35000, type: 'from' },
        { name: 'Outdoor seating', price: 45000, type: 'from' },
        { name: 'Bespoke / one-off builds', price: null, type: 'quote' },
      ],
    },
    {
      group: 'Repair & consultation',
      items: [
        { name: 'Minor weave repair', price: 8500, type: 'from', detail: 'Loose strands, small sections' },
        { name: 'Partial re-weave', price: 15000, type: 'from', detail: 'Seat, back, or panel refresh' },
        { name: 'Full re-weave', price: null, type: 'quote', detail: 'Quote after workshop assessment' },
        { name: 'Frame touch-up', price: 5000, type: 'from', detail: 'Coating or joint work where needed' },
        { name: 'Furniture consultation', price: 3500, type: 'fee', detail: 'Layout, materials & planning' },
      ],
    },
  ],
}

export const CRAFTSMANSHIP = [
  {
    src: '/images/projects/project-craftsmanship-weaving.jpg',
    alt: 'Kenyan artisan weaving black and white synthetic rattan onto a chair frame in the Ellines workshop',
    caption: 'Frame-first construction — handcrafted in Kenya',
  },
  {
    src: '/images/projects/project-craftsmanship-hand-weave.jpg',
    alt: "Close-up of Kenyan craftsman's hands weaving black and white rattan strips on a chair frame",
    caption: 'Precision weaving, stripe by stripe',
  },
  {
    src: '/images/projects/project-craftsmanship-overhead.jpg',
    alt: 'Overhead view of Kenyan artisan hand-weaving an armchair seat in the workshop',
    caption: 'Every seat shaped and finished by hand',
  },
  {
    src: '/images/projects/project-craftsmanship-chevron-detail.jpg',
    alt: 'Kenyan artisan finishing a white and brown chevron weave pattern on rattan bench',
    caption: 'Geometric patterns with premium finish',
  },
]

export const CONTACT_IMAGE = {
  src: '/images/projects/project-original-living-set-brown.jpg',
  alt: 'Brown and white rattan living collection by Ellines',
}
