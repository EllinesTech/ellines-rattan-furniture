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
import EnquiryItemsList from '../../components/EnquiryItemsList'
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
import {
  STATUS_OPTIONS,
  STATUS_LABELS,
  FILTER_LABELS,
  getRequestTypeLabel,
  fmtEnquiryDate,
  enquirySummary,
} from '../../utils/enquiries'
import { getRoleLabel } from '../../utils/roles'
import { signOutUser } from '../../utils/auth'
import {
  subscribeOrders,
  updateOrder,
  openInvoice,
  openReceipt,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from '../../utils/orders'
import './Dashboard.css'

export default function StaffDashboard() {
  const { user, setUser, isSuperAdmin } = useApp()
  const navigate = useNavigate()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [view, setView] = useState('enquiries')
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => {
    const unsub = subscribeOrders(setOrders)
    return () => unsub?.()
  }, [])

  useEffect(() => {
    if (!selectedOrder) return
    const fresh = orders.find((o) => o.id === selectedOrder.id)
    if (fresh) setSelectedOrder(fresh)
  }, [orders])

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
    if (isSuperAdmin) return true
    if (!q.assignedTo) return q.status === 'new' || !q.status
    return q.assignedTo === user?.id || q.assignedTo === user?.email
  })

  const filtered = myEnquiries.filter((q) => {
    if (filter === 'unread') return q.read !== true
    if (filter === 'all') return true
    return (q.status || 'new') === filter
  })

  const newCount = myEnquiries.filter((q) => (q.status === 'new' || !q.status) && !q.read).length
  const serviceCount = myEnquiries.filter((q) => q.requestType === 'service_request').length

  const patchEnquiry = async (enquiry, patch) => {
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

  const updateStatus = (enquiry, status) =>
    patchEnquiry(enquiry, { status, read: true, assignedTo: user?.id || user?.email })

  const assignToMe = (enquiry) =>
    patchEnquiry(enquiry, { assignedTo: user?.id || user?.email, read: true })

  const markRead = (enquiry) => patchEnquiry(enquiry, { read: true })

  const openEnquiry = (enquiry) => {
    setSelected(enquiry)
    if (!enquiry.read) markRead(enquiry)
  }

  const signOut = async () => {
    await signOutUser()
    setUser(null)
    navigate('/admin/login', { replace: true })
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
            {isSuperAdmin && (
              <Link to="/admin" className="btn btn-outline">Admin panel</Link>
            )}
            <Link to="/shop" className="btn btn-outline">Shop</Link>
            <button type="button" className="btn btn-outline" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="dash__main">
        <div className="dash__hero">
          <h1>Quote &amp; service enquiries</h1>
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
          <div className="dash-stat">
            <div className="dash-stat__value">{serviceCount}</div>
            <div className="dash-stat__label">Service requests</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat__value">{orders.length}</div>
            <div className="dash-stat__label">Orders</div>
          </div>
        </div>

        <div className="dash-filters" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className={`dash-filter-btn ${view === 'enquiries' ? 'dash-filter-btn--active' : ''}`}
            onClick={() => setView('enquiries')}
          >
            Enquiries
          </button>
          <button
            type="button"
            className={`dash-filter-btn ${view === 'orders' ? 'dash-filter-btn--active' : ''}`}
            onClick={() => setView('orders')}
          >
            Orders ({orders.length})
          </button>
        </div>

        {view === 'orders' ? (
          <div className="dash-split">
            <div className="dash-card">
              <div className="dash-card__head">
                <h2>Orders &amp; tracking</h2>
              </div>
              <div className="dash-card__body dash-table-wrap">
                {orders.length === 0 ? (
                  <div className="dash-empty">
                    <h3>No orders yet</h3>
                    <p>Create an order from a won enquiry in Admin → Enquiries or Control.</p>
                  </div>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
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
                          <td>
                            <strong>{o.orderNumber}</strong>
                            <div className="dash-table__sub">{o.invoiceNumber}</div>
                          </td>
                          <td>{o.customer?.name || '—'}</td>
                          <td>{ORDER_STATUS_LABELS[o.status] || o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {selectedOrder ? (
              <div className="dash-card">
                <div className="dash-card__head">
                  <h2>{selectedOrder.orderNumber}</h2>
                  <button type="button" onClick={() => setSelectedOrder(null)} className="dash-close-btn" aria-label="Close">
                    ✕
                  </button>
                </div>
                <div className="dash-detail">
                  <div className="dash-detail__meta">
                    <div>Invoice: {selectedOrder.invoiceNumber}</div>
                    <div>Receipt: {selectedOrder.receiptNumber}</div>
                    <div>Payment: {selectedOrder.paymentStatus || 'unpaid'}</div>
                    <div>📞 {selectedOrder.customer?.phone || '—'}</div>
                  </div>
                  <EnquiryItemsList items={selectedOrder.items || []} showPrices={false} />
                  <div className="form-group">
                    <label htmlFor="staff-order-status">Update status</label>
                    <select
                      id="staff-order-status"
                      className="field"
                      value={selectedOrder.status}
                      onChange={async (e) => {
                        const status = e.target.value
                        await updateOrder(selectedOrder.id, {
                          status,
                          trackingNote: `Status → ${ORDER_STATUS_LABELS[status]}`,
                        }, user)
                      }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="staff-track-note">Add tracking note</label>
                    <input
                      id="staff-track-note"
                      className="field"
                      placeholder="Press Enter to save"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          await updateOrder(selectedOrder.id, { trackingNote: e.target.value.trim() }, user)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                  {(selectedOrder.tracking || []).slice().reverse().map((t, i) => (
                    <p key={`${t.at}-${i}`} style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {new Date(t.at).toLocaleString('en-KE')} — {t.note}
                    </p>
                  ))}
                  <div className="dash-detail__actions">
                    <button type="button" className="btn btn-primary" onClick={() => openInvoice(selectedOrder)}>
                      Print invoice
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => openReceipt(selectedOrder)}>
                      Print receipt
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dash-card">
                <div className="dash-empty">
                  <h3>Select an order</h3>
                  <p>Update production status, tracking notes, and print documents.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
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
                  {FILTER_LABELS[f] || f}
                </button>
              ))}
            </div>
            <div className="dash-card__body dash-table-wrap">
              {loading ? (
                <p className="dash-empty">Loading…</p>
              ) : filtered.length === 0 ? (
                <div className="dash-empty">
                  <h3>No enquiries</h3>
                  <p>New quote and service requests will appear here.</p>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((q) => (
                      <tr
                        key={q.id}
                        className={`${selected?.id === q.id ? 'dash-table__row--active' : ''}${q.read === false ? ' dash-table__row--unread' : ''}`}
                        onClick={() => openEnquiry(q)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{q.customer?.name || '—'}</strong>
                          <div className="dash-table__sub">{q.customer?.phone}</div>
                          <div className="dash-table__sub">{enquirySummary(q.items)}</div>
                        </td>
                        <td>
                          <span className={`dash-type dash-type--${q.requestType || 'formal_quote'}`}>
                            {getRequestTypeLabel(q.requestType)}
                          </span>
                        </td>
                        <td>
                          <span className={`dash-status dash-status--${q.status || 'new'}`}>
                            {STATUS_LABELS[q.status] || q.status || 'new'}
                          </span>
                        </td>
                        <td className="dash-table__date">{fmtEnquiryDate(q.createdAt, true)}</td>
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
                <button type="button" onClick={() => setSelected(null)} className="dash-close-btn" aria-label="Close">
                  ✕
                </button>
              </div>
              <div className="dash-detail">
                <div className="dash-detail__meta">
                  <div>📞 {selected.customer?.phone}</div>
                  <div>✉️ {selected.customer?.email || '—'}</div>
                  <div>📍 {selected.customer?.location || '—'}</div>
                  <div>📋 {getRequestTypeLabel(selected.requestType)}</div>
                  {selected.budget && <div>💰 Budget: {selected.budget}</div>}
                  {selected.budgetTier && <div>📊 Tier: {selected.budgetTier}</div>}
                  <div>Preferred: {selected.preferredContact}</div>
                  {selected.estimatedTotal > 0 && (
                    <div>Estimate: {formatKes(selected.estimatedTotal)}</div>
                  )}
                  {selected.assignedTo && <div>Assigned: {selected.assignedTo}</div>}
                </div>

                <EnquiryItemsList items={selected.items || []} />

                {selected.notes && (
                  <>
                    <h3 className="dash-detail__heading">Notes</h3>
                    <p className="dash-detail__notes">{selected.notes}</p>
                  </>
                )}

                <div className="dash-filters dash-filters--inline">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`dash-filter-btn ${selected.status === s ? 'dash-filter-btn--active' : ''}`}
                      onClick={() => updateStatus(selected, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>

                <div className="dash-detail__actions">
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                    WhatsApp
                  </a>
                  <a href={mailLink} className="btn btn-outline">Email</a>
                  {!selected.assignedTo && (
                    <button type="button" className="btn btn-outline" onClick={() => assignToMe(selected)}>
                      Assign to me
                    </button>
                  )}
                  {selected.read === false && (
                    <button type="button" className="btn btn-outline" onClick={() => markRead(selected)}>
                      Mark read
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
        )}
      </main>
    </div>
  )
}
