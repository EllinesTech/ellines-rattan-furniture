/** Seed journal / project stories — CMS-editable. */
export const SEED_POSTS = [
  {
    id: 'seed-terrace-living',
    title: 'A terrace living set for Karen',
    slug: 'terrace-living-set-karen',
    excerpt:
      'How we scaled a modular lounge for an open terrace — weather-ready weave, soft cushions, and a footprint that leaves room to walk.',
    cover: '/images/projects/project-original-living-set-wide.jpg',
    body: `When Grace shared photos of her Karen terrace, the brief was clear: seating that felt like a living room outdoors, without crowding the view.

We started with measurements and a modular plan — two sofas and a corner, in a checkered brown-and-grey weave on powder-coated frames. Cushions were specified for outdoor evenings, with covers that can come indoors overnight.

Lead time was about five weeks from deposit. Delivery included placement and a quick care walkthrough. The result is a lounge that hosts weekend guests and still feels calm on quiet weekday mornings.

If you are planning a similar build, bring room photos and a rough budget range — we refine weave, frame, and layout in consultation.`,
    published: true,
    publishedAt: '2026-06-12T10:00:00.000Z',
    sortOrder: 0,
  },
  {
    id: 'seed-hospitality-patio',
    title: 'Restaurant patio seating in Westlands',
    slug: 'restaurant-patio-westlands',
    excerpt:
      'Contract quantities, staggered delivery, and weave that stands up to busy service — a hospitality project from brief to install.',
    cover: '/images/projects/project-original-modular-sections.jpg',
    body: `Hospitality briefs move fast. For a Westlands restaurant patio, the team needed modular sofas that looked cohesive across covers, with frames that could take daily turnover.

We locked weave colour and frame finish early, then produced in batches so the patio could open in stages. Trade pricing and a simple drawing pack helped the designer align the floor plan with our footprints.

Custom furniture for restaurants works best when measurements, guest flow, and cushion care are agreed before weaving starts. We are happy to share sample weaves and rough CAD outlines for serious trade projects.`,
    published: true,
    publishedAt: '2026-05-20T09:00:00.000Z',
    sortOrder: 1,
  },
  {
    id: 'seed-workshop-craft',
    title: 'Inside the weave: Nyeri atelier notes',
    slug: 'inside-the-weave-nyeri',
    excerpt:
      'A short look at how synthetic rattan is wrapped onto frames — stripe by stripe — in our Nyeri workshop.',
    cover: '/images/projects/project-craftsmanship-weaving.jpg',
    body: `Every Ellines piece begins with a frame. Steel, aluminium, wood, or a client-recommended material is prepared first; then artisans wrap premium synthetic rattan by hand.

Patterns — checkered, chevron, solid — are chosen with the space in mind. Outdoor pieces use UV-stable weave; indoor lounges can lean into softer colour stories.

Visiting Nairobi or Nyeri by appointment lets you feel samples before you commit. Bring inspiration photos; we translate them into weave and frame choices that fit Kenyan light and weather.`,
    published: true,
    publishedAt: '2026-04-08T08:00:00.000Z',
    sortOrder: 2,
  },
]

export function slugifyPostTitle(title = '') {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}
