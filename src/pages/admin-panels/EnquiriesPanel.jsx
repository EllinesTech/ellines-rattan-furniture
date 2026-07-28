import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../firebase'
import { FS } from '../../firestorePaths'
import { SITE } from '../../data/site'
import {
  buildQuoteMailto,
  buildQuoteWhatsAppMessage,
  buildWhatsAppLink,
  formatKes,
  loadLocalQuoteRequests,
  updateLocalQuoteRequest,
} from '../../utils/auth'
import EnquiryItemsList from '../../components/EnquiryItemsList'
import { useApp } from '../../context/AppContext'
import { getRequestTypeLabel, enquirySummary } from '../../utils/enquiries'
import { createOrderFromEnquiry } from '../../utils/orders'

const STATUS_OPTIONS = ['new', 'reviewing', 'quoted', 'won', 'lost']

const STATUS_COLORS = {
  new: { bg: 'rgba(232,131,42,0.12)', color: '#e8832a' },
  reviewing: { bg: 'rgba(74,158,255,0.1)', color: '#4a9eff' },
  quoted: { bg: 'rgba(201,168,76,0.12)', color: 'var(--gold)' },
  won: { bg: 'rgba(46,204,113,0.1)', color: 'var(--ok)' },
  lost: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
}

function fmtDate(value) {
  if (!value) return '—'
  try {
    const d = value?.toDate ? value.toDate() : new Date(value)
    return d.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const [o1, g] = [ctx.createOscillator(), ctx.createGain()]
    o1.connect(g)
    g.connect(ctx.destination)
    o1.frequency.setValueAtTime(660, ctx.currentTime)
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o1.start(ctx.currentTime)
    o1.stop(ctx.currentTime + 0.5)
  } catch {
    /* ignore */
  }
}

export default function EnquiriesPanel() {
  const { user, showToast } = useApp()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const prevIds = useRef(new Set())
  const mounted = useRef(false)
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const mergeLocal = (remote = []) => {
      const local = loadLocalQuoteRequests().map((q) => ({
        ...q,
        _local: true,
      }))
      const map = new Map()
      ;[...remote, ...local].forEach((q) => map.set(q.id, q))
      return [...map.values()].sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime()
        const tb = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime()
        return tb - ta
      })
    }

    if (!firebaseReady || !db) {
      const list = mergeLocal([])
      setEnquiries(list)
      setLoading(false)
      return undefined
    }

    const unsub = onSnapshot(
      collection(db, FS.QUOTE_REQUESTS),
      (snap) => {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        const merged = mergeLocal(remote)

        if (mounted.current) {
          merged.forEach((q) => {
            const isNew = (q.status === 'new' || !q.status) && q.read !== true
            if (isNew && !prevIds.current.has(q.id)) {
              playNotifSound()
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New quote enquiry — Ellines Rattan', {
                  body: `${q.customer?.name || 'Customer'} — ${q.items?.length || 0} item(s)`,
                  icon: '/images/logos/ellines-rattan-logo-transparent.png',
                  tag: q.id,
                })
              }
            }
          })
        }

        prevIds.current = new Set(merged.map((q) => q.id))
        mounted.current = true
        setEnquiries(merged)
        setLoading(false)
      },
      () => {
        setEnquiries(mergeLocal([]))
        setLoading(false)
      },
    )

    return () => unsub()
  }, [firebaseReady])

  const filtered = enquiries.filter((q) => {
    if (filter === 'unread') return q.read !== true
    if (filter === 'all') return true
    return (q.status || 'new') === filter
  })

  const unreadCount = enquiries.filter((q) => q.read !== true).length
  const serviceCount = enquiries.filter((q) => q.requestType === 'service_request').length
  const budgetCount = enquiries.filter((q) => q.requestType === 'budget_request').length

  const markRead = async (enquiry, read = true) => {
    if (enquiry._local) {
      updateLocalQuoteRequest(enquiry.id, { read })
      setEnquiries((prev) => prev.map((q) => (q.id === enquiry.id ? { ...q, read } : q)))
      if (selected?.id === enquiry.id) setSelected((s) => ({ ...s, read }))
      return
    }
    if (firebaseReady && db) {
      await setDoc(doc(db, FS.QUOTE_REQUESTS, enquiry.id), { read, updatedAt: serverTimestamp() }, { merge: true })
    }
  }

  const updateStatus = async (enquiry, status) => {
    if (enquiry._local) {
      updateLocalQuoteRequest(enquiry.id, { status, read: true })
      setEnquiries((prev) => prev.map((q) => (q.id === enquiry.id ? { ...q, status, read: true } : q)))
      if (selected?.id === enquiry.id) setSelected((s) => ({ ...s, status, read: true }))
      return
    }
    if (firebaseReady && db) {
      await setDoc(
        doc(db, FS.QUOTE_REQUESTS, enquiry.id),
        { status, read: true, updatedAt: serverTimestamp() },
        { merge: true },
      )
    }
  }

  async function handleCreateOrder() {
    if (!selected || creatingOrder) return
    setCreatingOrder(true)
    try {
      const order = await createOrderFromEnquiry(selected, user)
      showToast?.(`Order ${order.orderNumber} created`)
      if (selected.status !== 'won') await updateStatus(selected, 'won')
    } catch (err) {
      showToast?.(err?.message || 'Could not create order')
    } finally {
      setCreatingOrder(false)
    }
  }

  const openEnquiry = (enquiry) => {
    setSelected(enquiry)
    if (!enquiry.read) markRead(enquiry, true)
  }

  const waLink = selected
    ? buildWhatsAppLink({
        phone: selected.customer?.phone || SITE.phones[0].tel,
        message: buildQuoteWhatsAppMessage(selected),
      })
    : '#'

  const mailLink = selected
    ? buildQuoteMailto(selected, selected.customer?.email || SITE.email)
    : '#'

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Enquiries</h1>
          <p>
            {enquiries.length} requests
            {unreadCount > 0 && (
              <>
                {' '}
                · <strong style={{ color: '#e8832a' }}>{unreadCount} unread</strong>
              </>
            )}
            {serviceCount > 0 && <> · {serviceCount} service</>}
            {budgetCount > 0 && <> · {budgetCount} budget</>}
          </p>
        </div>
      </div>

      <div className="admin-filters">
        {['all', 'unread', ...STATUS_OPTIONS].map((f) => (
          <button
            key={f}
            type="button"
            className={`admin-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.1fr' : '1fr', gap: 16 }}>
        <div className="admin-table-wrap" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          {loading ? (
            <p style={{ padding: 24, color: 'var(--muted)' }}>Loading enquiries…</p>
          ) : filtered.length === 0 ? (
            <div className="dash-empty" style={{ padding: '2.5rem 1.5rem' }}>
              <h3>No enquiries yet</h3>
              <p>Quote and service requests from the shop and services page will appear here.</p>
              <Link to="/shop" className="btn btn-outline" style={{ marginTop: 12 }}>View shop</Link>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Estimate</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const st = q.status || 'new'
                  const sc = STATUS_COLORS[st] || STATUS_COLORS.new
                  return (
                    <tr
                      key={q.id}
                      onClick={() => openEnquiry(q)}
                      style={{
                        cursor: 'pointer',
                        background: selected?.id === q.id ? 'rgba(201,168,76,0.08)' : q.read === false ? 'rgba(232,131,42,0.05)' : undefined,
                      }}
                    >
                      <td>
                        <strong>{q.customer?.name || '—'}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{q.customer?.phone}</div>
                        {q._local && (
                          <span className="badge badge-gold" style={{ marginTop: 4 }}>
                            Local
                          </span>
                        )}
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {getRequestTypeLabel(q.requestType)}
                      </td>
                      <td>{q.estimatedTotal > 0 ? formatKes(q.estimatedTotal) : enquirySummary(q.items)}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}
                        >
                          {st}
                        </span>
                        {q.assignedTo && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                            → {q.assignedTo}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{fmtDate(q.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="card" style={{ padding: '1.25rem', maxHeight: '70vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: '1.1rem' }}>{selected.customer?.name}</h2>
              <button type="button" onClick={() => setSelected(null)} style={{ color: 'var(--muted)' }}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.7 }}>
              <div>📞 {selected.customer?.phone}</div>
              <div>✉️ {selected.customer?.email || '—'}</div>
              <div>📍 {selected.customer?.location || '—'}</div>
                  {selected.budget && <div>💰 Budget: {selected.budget}</div>}
              {selected.budgetTier && <div>📊 Tier: {selected.budgetTier}</div>}
              <div>📋 {getRequestTypeLabel(selected.requestType)}</div>
              <div>Preferred: {selected.preferredContact}</div>
            </div>

            <EnquiryItemsList items={selected.items || []} />

            {selected.notes && (
              <>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 6 }}>Notes</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                  {selected.notes}
                </p>
              </>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`admin-filter-btn ${selected.status === s ? 'active' : ''}`}
                  onClick={() => updateStatus(selected, s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                WhatsApp
              </a>
              <a href={mailLink} className="btn btn-outline">
                Email
              </a>
              {selected.read === false && (
                <button type="button" className="btn btn-outline" onClick={() => markRead(selected, true)}>
                  Mark read
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateOrder}
                disabled={creatingOrder}
              >
                {creatingOrder ? 'Creating…' : 'Create order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
