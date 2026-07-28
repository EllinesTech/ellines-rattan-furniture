import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useApp } from '../../context/AppContext'
import { db, isFirebaseConfigured } from '../../firebase'
import { FS } from '../../firestorePaths'
import { SITE } from '../../data/site'
import {
  buildQuoteWhatsAppMessage,
  buildWhatsAppLink,
  formatKes,
  loadLocalQuoteRequests,
} from '../../utils/auth'
import { getRoleLabel } from '../../utils/roles'
import './Dashboard.css'

const STATUS_LABELS = {
  new: 'Received',
  reviewing: 'Under review',
  quoted: 'Quote sent',
  won: 'Confirmed',
  lost: 'Closed',
}

function fmtDate(value) {
  if (!value) return '—'
  try {
    const d = value?.toDate ? value.toDate() : new Date(value)
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

export default function ClientDashboard() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => {
    const email = (user?.email || '').toLowerCase()
    const userId = user?.id

    const matchRequest = (q) =>
      (userId && q.userId === userId) ||
      (email && (q.clientEmail || q.customer?.email || '').toLowerCase() === email)

    const fromLocal = () =>
      loadLocalQuoteRequests()
        .filter(matchRequest)
        .map((q) => ({ ...q, _local: true }))

    if (!firebaseReady || !db) {
      setRequests(fromLocal())
      setLoading(false)
      return undefined
    }

    const unsubs = []

    const apply = (docs) => {
      const remote = docs.map((d) => ({ id: d.id, ...d.data() }))
      const merged = new Map()
      ;[...remote, ...fromLocal()].forEach((q) => merged.set(q.id, q))
      const list = [...merged.values()].sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime()
        const tb = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime()
        return tb - ta
      })
      setRequests(list)
      setLoading(false)
    }

    if (userId) {
      unsubs.push(
        onSnapshot(
          query(collection(db, FS.QUOTE_REQUESTS), where('userId', '==', userId)),
          (snap) => apply(snap.docs),
          () => {
            setRequests(fromLocal())
            setLoading(false)
          },
        ),
      )
    }

    if (email) {
      unsubs.push(
        onSnapshot(
          query(collection(db, FS.QUOTE_REQUESTS), where('clientEmail', '==', email)),
          (snap) => {
            const byEmail = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            setRequests((prev) => {
              const merged = new Map()
              ;[...prev, ...byEmail, ...fromLocal()].forEach((q) => merged.set(q.id, q))
              return [...merged.values()].sort((a, b) => {
                const ta = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime()
                const tb = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime()
                return tb - ta
              })
            })
            setLoading(false)
          },
          () => {},
        ),
      )
    }

    if (!userId && !email) {
      setRequests([])
      setLoading(false)
    }

    return () => unsubs.forEach((u) => u())
  }, [firebaseReady, user?.id, user?.email])

  const signOut = () => {
    setUser(null)
    navigate('/account/login', { replace: true })
  }

  const activeCount = requests.filter((q) => !['won', 'lost'].includes(q.status)).length

  const contactWa = selected
    ? buildWhatsAppLink({
        phone: SITE.whatsapp.number,
        message: `Hello Ellines, I'm following up on my quote request (${selected.id}).\n\n${buildQuoteWhatsAppMessage(selected)}`,
      })
    : buildWhatsAppLink({ phone: SITE.whatsapp.number, message: SITE.whatsapp.message })

  return (
    <div className="dash">
      <header className="dash__header">
        <div className="dash__header-inner">
          <Link to="/" className="dash__brand">
            <img src="/images/logos/ellines-rattan-logo-transparent.png" alt="" />
            <div>
              <strong>My Account</strong>
              <span>{user?.name}</span>
            </div>
          </Link>
          <div className="dash__nav">
            <span className="dash__role-badge">{getRoleLabel(user?.role)}</span>
            <Link to="/shop" className="btn btn-primary">Browse shop</Link>
            <Link to="/quote" className="btn btn-outline">New quote</Link>
            <button type="button" className="btn btn-outline" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="dash__main">
        <div className="dash__hero">
          <h1>Your quote requests</h1>
          <p>Track workshop estimates, follow up with our team, and start a new quote anytime.</p>
        </div>

        <div className="dash__stats">
          <div className="dash-stat">
            <div className="dash-stat__value">{requests.length}</div>
            <div className="dash-stat__label">Total requests</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat__value">{activeCount}</div>
            <div className="dash-stat__label">Active</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat__value">
              {requests.filter((q) => q.status === 'quoted').length}
            </div>
            <div className="dash-stat__label">Quotes received</div>
          </div>
        </div>

        <div className="dash-split">
          <div className="dash-card">
            <div className="dash-card__head">
              <h2>History</h2>
              <Link to="/quote" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                + New quote
              </Link>
            </div>
            <div className="dash-card__body" style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {loading ? (
                <p className="dash-empty">Loading…</p>
              ) : requests.length === 0 ? (
                <div className="dash-empty">
                  <h3>No quotes yet</h3>
                  <p>Browse our catalogue and build your first quote request.</p>
                  <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>
                    Start shopping
                  </Link>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((q) => (
                      <tr
                        key={q.id}
                        className={selected?.id === q.id ? 'dash-table__row--active' : ''}
                        onClick={() => setSelected(q)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{(q.items || []).length} item(s)</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            {q.estimatedTotal > 0 ? formatKes(q.estimatedTotal) : 'Custom quote'}
                          </div>
                        </td>
                        <td>
                          <span className={`dash-status dash-status--${q.status || 'new'}`}>
                            {STATUS_LABELS[q.status] || q.status || 'Received'}
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
                <h2>Request details</h2>
                <button type="button" onClick={() => setSelected(null)} style={{ color: 'var(--muted)' }}>
                  ✕
                </button>
              </div>
              <div className="dash-detail">
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>
                  Ref: <strong style={{ color: 'var(--text)' }}>{selected.id}</strong>
                </p>
                <div className="dash-detail__meta">
                  <div>Status: {STATUS_LABELS[selected.status] || selected.status || 'Received'}</div>
                  <div>Location: {selected.customer?.location || '—'}</div>
                  {selected.estimatedTotal > 0 && (
                    <div>Estimate: {formatKes(selected.estimatedTotal)}</div>
                  )}
                </div>

                <h3 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Items</h3>
                <ul className="dash-detail__items">
                  {(selected.items || []).map((item) => (
                    <li key={`${item.productId}-${item.title}`}>
                      {item.title} × {item.qty}
                    </li>
                  ))}
                </ul>

                {selected.notes && (
                  <>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: 6 }}>Your notes</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                      {selected.notes}
                    </p>
                  </>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a href={contactWa} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                    Follow up on WhatsApp
                  </a>
                  <Link to="/quote" className="btn btn-outline">
                    New quote
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="dash-card">
              <div className="dash-empty">
                <h3>Need help?</h3>
                <p>Our workshop team typically responds within one business day.</p>
                <a
                  href={contactWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa"
                  style={{ marginTop: 16 }}
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
