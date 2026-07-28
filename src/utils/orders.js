import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'
import { formatKes } from './auth'

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'in_production',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
]

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_production: 'In production',
  ready: 'Ready for delivery',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const PAYMENT_STATUSES = ['unpaid', 'deposit', 'paid', 'refunded']

const LOCAL_ORDERS_KEY = 'er_local_orders'
const LOCAL_COUNTER_KEY = 'er_order_counter'

function loadLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalOrders(orders) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders))
}

async function nextSequence(prefix) {
  const year = new Date().getFullYear()
  if (isFirebaseConfigured() && db) {
    const ref = doc(db, FS.SITE_DATA, FS.ORDER_COUNTER)
    const snap = await getDoc(ref)
    const data = snap.exists() ? snap.data() : {}
    const key = `${prefix}_${year}`
    const next = (data[key] || 0) + 1
    await setDoc(ref, { [key]: next, updatedAt: serverTimestamp() }, { merge: true })
    return `${prefix}-${year}-${String(next).padStart(4, '0')}`
  }
  const stored = JSON.parse(localStorage.getItem(LOCAL_COUNTER_KEY) || '{}')
  const key = `${prefix}_${year}`
  stored[key] = (stored[key] || 0) + 1
  localStorage.setItem(LOCAL_COUNTER_KEY, JSON.stringify(stored))
  return `${prefix}-${year}-${String(stored[key]).padStart(4, '0')}`
}

export async function createOrderFromEnquiry(enquiry, actor) {
  const orderNumber = await nextSequence('ORD')
  const invoiceNumber = await nextSequence('INV')
  const receiptNumber = await nextSequence('RCP')

  const order = {
    orderNumber,
    invoiceNumber,
    receiptNumber,
    enquiryId: enquiry.id || null,
    customer: enquiry.customer || {},
    clientEmail: enquiry.clientEmail || enquiry.customer?.email || null,
    userId: enquiry.userId || null,
    items: enquiry.items || [],
    estimatedTotal: enquiry.estimatedTotal || 0,
    finalTotal: enquiry.estimatedTotal || 0,
    requestType: enquiry.requestType || 'formal_quote',
    budget: enquiry.budget || '',
    notes: enquiry.notes || '',
    status: 'pending',
    paymentStatus: 'unpaid',
    tracking: [{ note: 'Order created from enquiry', at: new Date().toISOString(), by: actor?.email || 'system' }],
    createdBy: actor?.email || null,
    createdAt: new Date().toISOString(),
    source: 'enquiry',
  }

  if (isFirebaseConfigured() && db) {
    const ref = await addDoc(collection(db, FS.ORDERS), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: ref.id, ...order }
  }

  const entry = { id: `local_ord_${Date.now()}`, ...order, _local: true }
  saveLocalOrders([entry, ...loadLocalOrders()])
  return entry
}

export async function listOrders() {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(query(collection(db, FS.ORDERS), orderBy('createdAt', 'desc')))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.warn('[listOrders]', e.message)
    }
  }
  return loadLocalOrders()
}

export function subscribeOrders(callback) {
  if (isFirebaseConfigured() && db) {
    return onSnapshot(
      query(collection(db, FS.ORDERS), orderBy('createdAt', 'desc')),
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => callback(loadLocalOrders()),
    )
  }
  callback(loadLocalOrders())
  const onStorage = () => callback(loadLocalOrders())
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export async function updateOrder(orderId, patch, actor) {
  const trackingEntry = patch.trackingNote
    ? {
        tracking: [{ note: patch.trackingNote, at: new Date().toISOString(), by: actor?.email || 'admin' }],
      }
    : {}
  const payload = {
    ...patch,
    ...trackingEntry,
    updatedAt: serverTimestamp(),
    updatedBy: actor?.email || null,
  }
  delete payload.trackingNote

  if (orderId.startsWith('local_')) {
    const list = loadLocalOrders().map((o) => {
      if (o.id !== orderId) return o
      const merged = { ...o, ...patch }
      if (patch.trackingNote) {
        merged.tracking = [...(o.tracking || []), { note: patch.trackingNote, at: new Date().toISOString(), by: actor?.email || 'admin' }]
      }
      return merged
    })
    saveLocalOrders(list)
    return list.find((o) => o.id === orderId)
  }

  if (isFirebaseConfigured() && db) {
    const ref = doc(db, FS.ORDERS, orderId)
    const snap = await getDoc(ref)
    const existing = snap.exists() ? snap.data() : {}
    if (patch.trackingNote) {
      payload.tracking = [...(existing.tracking || []), { note: patch.trackingNote, at: new Date().toISOString(), by: actor?.email || 'admin' }]
    }
    await setDoc(ref, payload, { merge: true })
    const updated = await getDoc(ref)
    return { id: updated.id, ...updated.data() }
  }
  return null
}

export function ordersForClient(orders, user) {
  const email = (user?.email || '').toLowerCase()
  const userId = user?.id
  return orders.filter(
    (o) =>
      (userId && o.userId === userId) ||
      (email && (o.clientEmail || o.customer?.email || '').toLowerCase() === email),
  )
}

function buildDocHtml(type, order) {
  const items = (order.items || [])
    .map(
      (i) =>
        `<tr><td>${i.title}${i.itemType === 'service' ? ' (Service)' : ''}</td><td>${i.qty}</td><td>${i.quoteOnly ? 'Quote' : formatKes(i.unitPrice)}</td></tr>`,
    )
    .join('')
  const total = order.finalTotal || order.estimatedTotal
  const label = type === 'invoice' ? 'INVOICE' : 'RECEIPT'
  const number = type === 'invoice' ? order.invoiceNumber : order.receiptNumber

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${label} ${number}</title>
<style>
body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:24px;color:#1a1a1a}
h1{color:#8b6914;border-bottom:2px solid #c9a84c;padding-bottom:8px}
.meta{margin:20px 0;line-height:1.7}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:10px;text-align:left;font-size:14px}
th{background:#f5f0e6}
.total{font-size:1.2rem;font-weight:bold;text-align:right;margin-top:16px}
.footer{margin-top:40px;font-size:12px;color:#666}
@media print{body{margin:0}}
</style></head><body>
<h1>Ellines Rattan Furniture</h1>
<h2>${label} · ${number}</h2>
<p><strong>Order:</strong> ${order.orderNumber}</p>
<div class="meta">
<p><strong>Customer:</strong> ${order.customer?.name || '—'}<br>
<strong>Phone:</strong> ${order.customer?.phone || '—'}<br>
<strong>Email:</strong> ${order.customer?.email || '—'}<br>
<strong>Date:</strong> ${new Date().toLocaleDateString('en-KE')}</p>
</div>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${items}</tbody></table>
<div class="total">Total: ${total > 0 ? formatKes(total) : 'As quoted'}</div>
<p><strong>Status:</strong> ${ORDER_STATUS_LABELS[order.status] || order.status} · <strong>Payment:</strong> ${order.paymentStatus || 'unpaid'}</p>
<div class="footer">Nyeri & Nairobi workshops · info@ellines.co.ke · rattanfurniture.ellines.co.ke</div>
<script>window.onload=()=>window.print()</script></body></html>`
}

export function openInvoice(order) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(buildDocHtml('invoice', order))
    w.document.close()
  }
}

export function openReceipt(order) {
  const w = window.open('', '_blank')
  if (w) {
    w.document.write(buildDocHtml('receipt', order))
    w.document.close()
  }
}
