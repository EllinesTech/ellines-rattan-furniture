import { useApp } from '../context/AppContext'
import { PAGE_META } from '../data/pages'

export function usePageMeta(key) {
  const { sitePages } = useApp()
  const staticMeta = PAGE_META[key] || PAGE_META.home
  const override = sitePages?.[key]
  if (!override) return staticMeta
  return { ...staticMeta, ...override }
}
