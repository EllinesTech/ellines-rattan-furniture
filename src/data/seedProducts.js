import { GALLERY_ITEMS } from './gallery'
import {
  DEFAULT_FRAME_OPTIONS,
  WEAVE_MATERIAL,
} from './productOptions'

/** Starting prices aligned with Kenya market (Kenty, Fair Price, Jardin Classics — Jul 2026). */
const DEFAULT_PRICES = {
  'Living Sets': 165000,
  Sofas: 125000,
  Armchairs: 45000,
  Cabinets: 45000,
  Tables: 28000,
  Seating: 32000,
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
      description: `Handcrafted ${item.category.toLowerCase()} in ${WEAVE_MATERIAL.toLowerCase()} — choose metal, aluminium, wood, or powder-coated steel frames. Colour, weave, and sizing available on request.`,
      startingPrice: quoteOnly ? null : DEFAULT_PRICES[item.category],
      quoteOnly,
      weaveMaterial: WEAVE_MATERIAL,
      frameOptions: DEFAULT_FRAME_OPTIONS.map((o) => ({ ...o })),
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
