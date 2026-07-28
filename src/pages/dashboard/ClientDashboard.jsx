import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useApp } from '../../context/AppContext'
import EnquiryItemsList from '../../components/EnquiryItemsList'
import { db, isFirebaseConfigured } from '../../firebase'
import { FS } from '../../firestorePaths'
import { SITE } from '../../data/site'
import {
  buildQuoteWhatsAppMessage,
  buildWhatsAppLink,
  formatKes,
  loadLocalQuoteRequests,
  signOutUser,
} from '../../utils/auth'
import {
  subscribeOrders,
  ordersForClient,
  ORDER_STATUS_LABELS,
  openInvoice,
  openReceipt,
} from '../../utils/orders'
import {
  CLIENT_STATUS_LABELS,
  getRequestTypeLabel,
  fmtEnquiryDate,
  enquirySummary,
} from '../../utils/enquiries'
import { getRoleLabel } from '../../utils/roles'
import './Dashboard.css'

export default function ClientDashboard() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => {
    const unsub = subscribeOrders((all) => setOrders(ordersForClient(all, user)))
    return () => unsub?.()
  }, [user?.id, user?.email])

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

  const signOut = async () => {
    await signOutUser()
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
            <Link to="/services" className="btn btn-outline">Services</Link>
            <Link to="/shop" className="btn btn-primary">Browse shop</Link>
            <Link to="/quote" className="btn btn-outline">New quote</Link>
            <button type="button" className="btn btn-outline" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="dash__main">
        <div className="dash__hero">
          <h1>Your requests</h1>
          <p>Track quotes, service requests, and follow up with our workshop team anytime.</p>
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
          <div className="dash-stat">
            <div className="dash-stat__value">{orders.length}</div>
            <div className="dash-stat__label">Orders</div>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
            <div className="dash-card__head">
              <h2>Order tracking</h2>
            </div>
            <div className="dash-card__body dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className={selectedOrder?.id === o.id ? 'dash-table__row--active' : ''}
                      onClick={() => setSelectedOrder(o)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{o.orderNumber}</strong></td>
                      <td>{ORDER_STATUS_LABELS[o.status] || o.status}</td>
                      <td>{o.paymentStatus || 'unpaid'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedOrder && (
              <div className="dash-detail">
                <p className="dash-detail__ref">Invoice: {selectedOrder.invoiceNumber}</p>
                <EnquiryItemsList items={selectedOrder.items || []} showPrices={false} />
                {(selectedOrder.tracking || []).slice().reverse().map((t, i) => (
                  <p key={`${t.at}-${i}`} style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {new Date(t.at).toLocaleString('en-KE')} — {t.note}
                  </p>
                ))}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <button type="button" className="btn btn-primary" onClick={() => openInvoice(selectedOrder)}>
                    Print invoice
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => openReceipt(selectedOrder)}>
                    Print receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="dash-split">
          <div className="dash-card">
            <div className="dash-card__head">
              <h2>History</h2>
              <Link to="/quote" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                + New request
              </Link>
            </div>
            <div className="dash-card__body dash-table-wrap">
              {loading ? (
                <p className="dash-empty">Loading…</p>
              ) : requests.length === 0 ? (
                <div className="dash-empty">
                  <h3>No requests yet</h3>
                  <p>Browse our catalogue, request a service, or build your first quote.</p>
                  <div className="dash-empty__actions">
                    <Link to="/services" className="btn btn-primary">Request a service</Link>
                    <Link to="/shop" className="btn btn-outline">Browse shop</Link>
                  </div>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Summary</th>
                      <th>Type</th>
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
                          <strong>{enquirySummary(q.items)}</strong>
                          <div className="dash-table__sub">
                            {q.estimatedTotal > 0 ? formatKes(q.estimatedTotal) : 'Custom quote'}
                          </div>
                        </td>
                        <td>
                          <span className={`dash-type dash-type--${q.requestType || 'formal_quote'}`}>
                            {getRequestTypeLabel(q.requestType)}
                          </span>
                        </td>
                        <td>
                          <span className={`dash-status dash-status--${q.status || 'new'}`}>
                            {CLIENT_STATUS_LABELS[q.status] || q.status || 'Received'}
                          </span>
                        </td>
                        <td className="dash-table__date">{fmtEnquiryDate(q.createdAt)}</td>
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
                <button type="button" onClick={() => setSelected(null)} className="dash-close-btn" aria-label="Close">
                  ✕
                </button>
              </div>
              <div className="dash-detail">
                <p className="dash-detail__ref">
                  Ref: <strong>{selected.id}</strong>
                </p>
                <div className="dash-detail__meta">
                  <div>Status: {CLIENT_STATUS_LABELS[selected.status] || selected.status || 'Received'}</div>
                  <div>Type: {getRequestTypeLabel(selected.requestType)}</div>
                  <div>Location: {selected.customer?.location || '—'}</div>
                  {selected.budget && <div>Budget: {selected.budget}</div>}
                  {selected.budgetTier && <div>Budget tier: {selected.budgetTier}</div>}
                  {selected.estimatedTotal > 0 && (
                    <div>Estimate: {formatKes(selected.estimatedTotal)}</div>
                  )}
                </div>

                <EnquiryItemsList items={selected.items || []} showPrices={false} />

                {selected.notes && (
                  <>
                    <h3 className="dash-detail__heading">Your notes</h3>
                    <p className="dash-detail__notes">{selected.notes}</p>
                  </>
                )}

                <div className="dash-detail__actions">
                  <a href={contactWa} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                    Follow up on WhatsApp
                  </a>
                  <Link to="/services" className="btn btn-outline">Request another service</Link>
                  <Link to="/quote" className="btn btn-outline">New quote</Link>
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
