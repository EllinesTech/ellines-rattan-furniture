import { GALLERY_ITEMS } from './gallery'

const DEFAULT_PRICES = {
  'Living Sets': 185000,
  Sofas: 145000,
  Armchairs: 65000,
  Cabinets: 55000,
  Tables: 35000,
  Seating: 45000,
  Craftsmanship: null,
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Seed catalogue derived from gallery — used when Firestore is empty or offline. */
export function buildSeedProducts() {
  return GALLERY_ITEMS.filter((item) => item.category !== 'Craftsmanship').map((item, index) => {
    const quoteOnly = DEFAULT_PRICES[item.category] == null
    return {
      id: slugify(item.title),
      title: item.title,
      category: item.category,
      src: item.src,
      description: `Handcrafted ${item.category.toLowerCase()} — custom weave, colour, and sizing available.`,
      startingPrice: quoteOnly ? null : DEFAULT_PRICES[item.category],
      quoteOnly,
      active: true,
      featured: Boolean(item.featured),
      sortOrder: index,
    }
  })
}

export const SEED_PRODUCTS = buildSeedProducts()

export const SHOP_CATEGORIES = [
  'All',
  'Living Sets',
  'Sofas',
  'Armchairs',
  'Cabinets',
  'Tables',
  'Seating',
]
