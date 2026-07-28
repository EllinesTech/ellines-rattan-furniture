import { formatKes } from './auth'

export const STATUS_OPTIONS = ['new', 'reviewing', 'quoted', 'won', 'lost']

export const STATUS_LABELS = {
  new: 'New',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}

export const CLIENT_STATUS_LABELS = {
  new: 'Received',
  reviewing: 'Under review',
  quoted: 'Quote sent',
  won: 'Confirmed',
  lost: 'Closed',
}

export const REQUEST_TYPE_LABELS = {
  formal_quote: 'Formal quote',
  budget_request: 'Budget request',
  service_request: 'Service request',
}

export const FILTER_LABELS = {
  all: 'All',
  unread: 'Unread',
  ...STATUS_LABELS,
}

export function getRequestTypeLabel(type) {
  return REQUEST_TYPE_LABELS[type] || 'Quote'
}

export function splitEnquiryItems(items = []) {
  const services = items.filter((i) => i.itemType === 'service')
  const products = items.filter((i) => i.itemType !== 'service')
  return { services, products }
}

export function fmtEnquiryDate(value, withTime = false) {
  if (!value) return '—'
  try {
    const d = value?.toDate ? value.toDate() : new Date(value)
    return d.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    })
  } catch {
    return '—'
  }
}

export function enquirySummary(items = []) {
  const { services, products } = splitEnquiryItems(items)
  const parts = []
  if (services.length) parts.push(`${services.length} service${services.length > 1 ? 's' : ''}`)
  if (products.length) parts.push(`${products.length} product${products.length > 1 ? 's' : ''}`)
  return parts.join(' · ') || `${items.length} item(s)`
}
