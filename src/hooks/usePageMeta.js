import { useApp } from '../context/AppContext'
import { PAGE_META } from '../data/pages'
import { getDefaultPageContent } from '../data/pageContentDefaults'

function deepMergeContent(base, override) {
  if (!override) return base
  const out = { ...base, ...override }
  for (const key of Object.keys(override)) {
    const b = base?.[key]
    const o = override[key]
    if (Array.isArray(o)) {
      out[key] = o
    } else if (o && typeof o === 'object' && b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = { ...b, ...o }
    }
  }
  return out
}

/** Full page meta + editable body content for CMS-driven pages. */
export function usePageMeta(key) {
  const { sitePages } = useApp()
  const staticMeta = PAGE_META[key] || PAGE_META.home
  const defaults = getDefaultPageContent(key)
  const override = sitePages?.[key]

  const merged = override ? { ...staticMeta, ...override } : { ...staticMeta }
  const content = deepMergeContent(defaults, override?.content || defaults)

  return {
    ...merged,
    content,
  }
}
