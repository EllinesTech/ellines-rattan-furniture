/** Weave material is fixed site-wide — clients choose frame/base materials. */
export const WEAVE_MATERIAL = 'Synthetic rattan'

export const WEAVE_NOTE =
  'All Ellines pieces are hand-woven in premium synthetic rattan — UV-stabilised and suited to Kenyan climates.'

/** Default frame/base materials clients can choose when quoting. */
export const DEFAULT_FRAME_OPTIONS = [
  { id: 'metal', label: 'Metal', priceAdd: 0 },
  { id: 'aluminium', label: 'Aluminium', priceAdd: 0 },
  { id: 'wood', label: 'Wood', priceAdd: 0 },
  { id: 'powder-coated-steel', label: 'Powder-coated steel', priceAdd: 0 },
]

export const FRAME_CHOICE_NOTE =
  'Choose your frame — metal, aluminium, wood, or powder-coated steel. Prices vary by material and finish.'

export const PRICING_VARIES_NOTE =
  'Catalogue prices are starting guides for a base configuration. Frame material, size, weave pattern, and finish change the final workshop quote.'

export const ANY_SPACE_NOTE =
  'Our tailored furniture suits any space — from your bedroom and living room to hospitality venues and business interiors.'

export function slugifyFrameLabel(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Normalize frame option rows from seed, admin, or Firestore. */
export function normalizeFrameOptions(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_FRAME_OPTIONS.map((o) => ({ ...o }))
  }
  return raw
    .map((item, index) => {
      if (typeof item === 'string') {
        const label = item.trim()
        if (!label) return null
        return {
          id: slugifyFrameLabel(label) || `frame-${index}`,
          label,
          priceAdd: 0,
        }
      }
      const label = String(item?.label || item?.name || '').trim()
      if (!label) return null
      const id = String(item?.id || slugifyFrameLabel(label) || `frame-${index}`)
      const priceAdd = Number(item?.priceAdd)
      return {
        id,
        label,
        priceAdd: Number.isFinite(priceAdd) ? priceAdd : 0,
      }
    })
    .filter(Boolean)
}

export function parseFrameOptionsInput(text) {
  const labels = String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return normalizeFrameOptions(labels)
}

export function formatFrameOptionsInput(options) {
  return normalizeFrameOptions(options)
    .map((o) => o.label)
    .join(', ')
}

export function findFrameOption(options, frameMaterial) {
  const list = normalizeFrameOptions(options)
  if (!frameMaterial) return list[0] || null
  const needle = String(frameMaterial).toLowerCase()
  return (
    list.find((o) => o.id === needle || o.label.toLowerCase() === needle) ||
    list[0] ||
    null
  )
}

export function resolveUnitPrice(basePrice, frameOption, quoteOnly = false) {
  if (quoteOnly || basePrice == null) return null
  const add = Number(frameOption?.priceAdd) || 0
  return Number(basePrice) + add
}
