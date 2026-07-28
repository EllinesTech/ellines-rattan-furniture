import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useApp } from '../../context/AppContext'
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
import { getRoleLabel } from '../../utils/roles'
import './Dashboard.css'

const STATUS_OPTIONS = ['new', 'reviewing', 'quoted', 'won', 'lost']

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

export default function StaffDashboard() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => {
    const mergeLocal = (remote = []) => {
      const local = loadLocalQuoteRequests().map((q) => ({ ...q, _local: true }))
      const map = new Map()
      ;[...remote, ...local].forEach((q) => map.set(q.id, q))
      return [...map.values()].sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime()
        const tb = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime()
        return tb - ta
      })
    }

    if (!firebaseReady || !db) {
      setEnquiries(mergeLocal([]))
      setLoading(false)
      return undefined
    }

    const unsub = onSnapshot(
      collection(db, FS.QUOTE_REQUESTS),
      (snap) => {
        const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setEnquiries(mergeLocal(remote))
        setLoading(false)
      },
      () => {
        setEnquiries(mergeLocal([]))
        setLoading(false)
      },
    )
    return () => unsub()
  }, [firebaseReady])

  const myEnquiries = enquiries.filter((q) => {
    if (user?.role === 'superadmin') return true
    if (!q.assignedTo) return q.status === 'new' || !q.status
    return q.assignedTo === user?.id || q.assignedTo === user?.email
  })

  const filtered = myEnquiries.filter((q) => {
    if (filter === 'unread') return q.read !== true
    if (filter === 'all') return true
    return (q.status || 'new') === filter
  })

  const newCount = myEnquiries.filter((q) => (q.status === 'new' || !q.status) && !q.read).length

  const updateStatus = async (enquiry, status) => {
    const patch = { status, read: true, assignedTo: user?.id || user?.email }
    if (enquiry._local) {
      updateLocalQuoteRequest(enquiry.id, patch)
      setEnquiries((prev) => prev.map((q) => (q.id === enquiry.id ? { ...q, ...patch } : q)))
      if (selected?.id === enquiry.id) setSelected((s) => ({ ...s, ...patch }))
      return
    }
    if (firebaseReady && db) {
      await setDoc(
        doc(db, FS.QUOTE_REQUESTS, enquiry.id),
        { ...patch, updatedAt: serverTimestamp() },
        { merge: true },
      )
    }
  }

  const assignToMe = async (enquiry) => {
    const patch = { assignedTo: user?.id || user?.email, read: true }
    if (enquiry._local) {
      updateLocalQuoteRequest(enquiry.id, patch)
      setEnquiries((prev) => prev.map((q) => (q.id === enquiry.id ? { ...q, ...patch } : q)))
      if (selected?.id === enquiry.id) setSelected((s) => ({ ...s, ...patch }))
      return
    }
    if (firebaseReady && db) {
      await setDoc(doc(db, FS.QUOTE_REQUESTS, enquiry.id), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
    }
  }

  const signOut = () => {
    setUser(null)
    navigate('/admin/login', { replace: true })
  }

  const waLink = selected
    ? buildWhatsAppLink({
        phone: selected.customer?.phone || SITE.phones[0].tel,
        message: buildQuoteWhatsAppMessage(selected),
      })
    : '#'

  return (
    <div className="dash">
      <header className="dash__header">
        <div className="dash__header-inner">
          <Link to="/" className="dash__brand">
            <img src="/images/logos/ellines-rattan-logo-transparent.png" alt="" />
            <div>
              <strong>Staff Dashboard</strong>
              <span>{user?.name}</span>
            </div>
          </Link>
          <div className="dash__nav">
            <span className="dash__role-badge">{getRoleLabel(user?.role)}</span>
            <Link to="/shop" className="btn btn-outline">Shop</Link>
            <button type="button" className="btn btn-outline" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="dash__main">
        <div className="dash__hero">
          <h1>Quote enquiries</h1>
          <p>Review assigned requests, update status, and contact customers directly.</p>
        </div>

        <div className="dash__stats">
          <div className="dash-stat">
            <div className="dash-stat__value">{myEnquiries.length}</div>
            <div className="dash-stat__label">In queue</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat__value">{newCount}</div>
            <div className="dash-stat__label">New / unread</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat__value">
              {myEnquiries.filter((q) => q.status === 'quoted').length}
            </div>
            <div className="dash-stat__label">Quoted</div>
          </div>
        </div>

        <div className="dash-split">
          <div className="dash-card">
            <div className="dash-card__head">
              <h2>Requests</h2>
            </div>
            <div className="dash-filters">
              {['all', 'unread', ...STATUS_OPTIONS].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`dash-filter-btn ${filter === f ? 'dash-filter-btn--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="dash-card__body" style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {loading ? (
                <p className="dash-empty">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="dash-empty">
                  <h3>No enquiries</h3>
                  <p>New quote requests will appear here.</p>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q) => (
                      <tr
                        key={q.id}
                        className={selected?.id === q.id ? 'dash-table__row--active' : ''}
                        onClick={() => setSelected(q)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{q.customer?.name || '—'}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            {q.customer?.phone}
                          </div>
                        </td>
                        <td>
                          <span className={`dash-status dash-status--${q.status || 'new'}`}>
                            {q.status || 'new'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {fmtDate(q.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {selected ? (
            <div className="dash-card">
              <div className="dash-card__head">
                <h2>{selected.customer?.name}</h2>
                <button type="button" onClick={() => setSelected(null)} style={{ color: 'var(--muted)' }}>
                  ✕
                </button>
              </div>
              <div className="dash-detail">
                <div className="dash-detail__meta">
                  <div>📞 {selected.customer?.phone}</div>
                  <div>✉️ {selected.customer?.email || '—'}</div>
                  <div>📍 {selected.customer?.location || '—'}</div>
                  {selected.budget && <div>💰 Budget: {selected.budget}</div>}
                  <div>Preferred: {selected.preferredContact}</div>
                  {selected.estimatedTotal > 0 && (
                    <div>Estimate: {formatKes(selected.estimatedTotal)}</div>
                  )}
                </div>

                <h3 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Items</h3>
                <ul className="dash-detail__items">
                  {(selected.items || []).map((item) => (
                    <li key={`${item.productId}-${item.title}`}>
                      {item.title} × {item.qty}{' '}
                      <span style={{ color: 'var(--muted)' }}>
                        ({item.quoteOnly ? 'Quote only' : formatKes(item.unitPrice)})
                      </span>
                    </li>
                  ))}
                </ul>

                {selected.notes && (
                  <>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 6 }}>Notes</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                      {selected.notes}
                    </p>
                  </>
                )}

                <div className="dash-filters" style={{ padding: '0 0 16px', border: 'none' }}>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`dash-filter-btn ${selected.status === s ? 'dash-filter-btn--active' : ''}`}
                      onClick={() => updateStatus(selected, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                    WhatsApp customer
                  </a>
                  {!selected.assignedTo && (
                    <button type="button" className="btn btn-outline" onClick={() => assignToMe(selected)}>
                      Assign to me
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="dash-card">
              <div className="dash-empty">
                <h3>Select a request</h3>
                <p>Click a row to view details and update status.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
