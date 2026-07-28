import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { useApp } from '../../context/AppContext'
import { PAGE_META } from '../../data/pages'
import { db, isFirebaseConfigured } from '../../firebase'
import { FS } from '../../firestorePaths'
import {
  listAdminAccounts,
  listStaffAccounts,
  formatKes,
  loadLocalQuoteRequests,
} from '../../utils/auth'
import {
  subscribeOrders,
  createOrderFromEnquiry,
  updateOrder,
  openInvoice,
  openReceipt,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
} from '../../utils/orders'
import { getRequestTypeLabel } from '../../utils/enquiries'
import EnquiryItemsList from '../../components/EnquiryItemsList'
import { listSubscriptions } from '../../utils/subscriptions'
import PageCmsEditor, { buildPageDraft } from './PageCmsEditor'
import { seedMediaLibrary, listMediaLibrary } from '../../utils/mediaLibrary'
import { SEED_MEDIA_LIBRARY } from '../../data/seedMedia'

const SUB_TABS = [
  { id: 'overview', label: 'Overview', icon: '🎛️' },
  { id: 'pages', label: 'Pages', icon: '📄' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'media', label: 'Media', icon: '🖼️' },
  { id: 'users', label: 'Users', icon: '👤' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
]

export default function GodModePanel() {
  const { user, sitePages, sitePagesSource, saveSitePages, firebaseReady, showToast } = useApp()
  const [sub, setSub] = useState('overview')
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [enquiries, setEnquiries] = useState([])
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [media, setMedia] = useState(SEED_MEDIA_LIBRARY)
  const [pageKey, setPageKey] = useState(Object.keys(PAGE_META)[0])
  const [pageDraft, setPageDraft] = useState(() => buildPageDraft(Object.keys(PAGE_META)[0], null))
  const [saving, setSaving] = useState(false)
  const [seedingMedia, setSeedingMedia] = useState(false)
  const [poster, setPoster] = useState({
    title: 'Handcrafted Rattan',
    subtitle: 'Workshop-direct pricing · Nairobi & Nyeri',
    price: 'From KSh 32,000',
    image: '/images/projects/project-original-living-set-wide.jpg',
    cta: 'WhatsApp for a quote',
  })
  const [enquiryPick, setEnquiryPick] = useState('')
  const [finalTotalDraft, setFinalTotalDraft] = useState('')
  const canvasRef = useRef(null)

  const pageKeys = useMemo(() => Object.keys(sitePages || PAGE_META), [sitePages])

  useEffect(() => {
    setPageDraft(buildPageDraft(pageKey, sitePages))
  }, [pageKey, sitePages])

  useEffect(() => {
    listMediaLibrary().then(setMedia).catch(() => setMedia(SEED_MEDIA_LIBRARY))
  }, [firebaseReady])

  useEffect(() => {
    const unsub = subscribeOrders(setOrders)
    return () => unsub?.()
  }, [])

  useEffect(() => {
    if (!selectedOrder) return
    const fresh = orders.find((o) => o.id === selectedOrder.id)
    if (fresh && fresh !== selectedOrder) setSelectedOrder(fresh)
  }, [orders])

  useEffect(() => {
    setEnquiries(loadLocalQuoteRequests())
    if (!firebaseReady || !db) return undefined
    getDocs(collection(db, FS.QUOTE_REQUESTS)).then((snap) => {
      const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const map = new Map()
      ;[...remote, ...loadLocalQuoteRequests()].forEach((q) => map.set(q.id, q))
      setEnquiries([...map.values()])
    })
    return undefined
  }, [firebaseReady])

  useEffect(() => {
    const load = async () => {
      const staff = await listStaffAccounts()
      const admins = await listAdminAccounts()
      setUsers([
        ...admins.map((a) => ({ ...a, kind: 'admin' })),
        ...staff.map((u) => ({ ...u, kind: u.role || 'staff' })),
      ])
    }
    load()
  }, [])

  useEffect(() => {
    listSubscriptions().then(setSubscriptions)
  }, [firebaseReady])

  useEffect(() => {
    if (!firebaseReady || !db) return undefined
    getDocs(collection(db, FS.MEDIA)).then((snap) => {
      if (snap.docs.length) {
        setMedia(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      }
    }).catch(() => {})
    return undefined
  }, [firebaseReady])

  useEffect(() => {
    if (selectedOrder) {
      setFinalTotalDraft(selectedOrder.finalTotal != null ? String(selectedOrder.finalTotal) : '')
    }
  }, [selectedOrder?.id])

  const stats = useMemo(
    () => ({
      orders: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      enquiries: enquiries.length,
      subscribers: subscriptions.length,
      users: users.length,
    }),
    [orders, enquiries, subscriptions, users],
  )

  const savePage = async () => {
    setSaving(true)
    try {
      await saveSitePages({ ...sitePages, [pageKey]: { ...pageDraft } })
      showToast(`Page “${pageKey}” saved — live on the site`)
    } catch (e) {
      showToast(`Save failed: ${e.message}`)
    }
    setSaving(false)
  }

  const resetPage = () => {
    setPageDraft(buildPageDraft(pageKey, null))
    showToast('Draft reset to defaults (Save to publish)')
  }

  const importAllMedia = async () => {
    setSeedingMedia(true)
    try {
      const result = await seedMediaLibrary()
      const list = await listMediaLibrary()
      setMedia(list)
      showToast(
        result.mode === 'local'
          ? `Loaded ${result.total} site images locally`
          : `Imported ${result.added} new images (${result.total} in library)`,
      )
    } catch (e) {
      showToast(e.message || 'Media import failed — sign in again?')
    }
    setSeedingMedia(false)
  }

  const handleCreateOrder = async (enquiry) => {
    try {
      const order = await createOrderFromEnquiry(enquiry, user)
      showToast(`Order ${order.orderNumber} created`)
      setSelectedOrder(order)
      setSub('orders')
    } catch (e) {
      showToast(e.message || 'Could not create order')
    }
  }

  const handleOrderPatch = async (patch) => {
    if (!selectedOrder) return
    const updated = await updateOrder(selectedOrder.id, patch, user)
    if (updated) setSelectedOrder(updated)
  }

  const saveMediaItem = async (item) => {
    if (!firebaseReady || !db) {
      setMedia((prev) => [...prev, item])
      showToast('Media saved locally')
      return
    }
    await addDoc(collection(db, FS.MEDIA), { ...item, createdAt: serverTimestamp() })
    showToast('Media added')
    const snap = await getDocs(collection(db, FS.MEDIA))
    setMedia(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }

  const uploadMedia = async (file, meta) => {
    const { uploadMediaFile } = await import('../../utils/media')
    const item = await uploadMediaFile(file, { ...meta, uploadedBy: user?.email })
    setMedia((prev) => [item, ...prev.filter((m) => m.src !== item.src)])
    showToast('Image uploaded to Storage')
  }

  const removeMedia = async (item) => {
    try {
      const { deleteMediaItem } = await import('../../utils/media')
      if (item.id) await deleteMediaItem(item)
      setMedia((prev) => prev.filter((m) => m.id !== item.id && m.src !== item.src))
      showToast('Media removed')
    } catch (e) {
      showToast(e.message || 'Could not remove media')
    }
  }

  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = 1080
    const h = 1350
    canvas.width = w
    canvas.height = h

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h * 0.62)
      const grad = ctx.createLinearGradient(0, h * 0.45, 0, h)
      grad.addColorStop(0, 'rgba(10,10,15,0)')
      grad.addColorStop(1, 'rgba(10,10,15,0.95)')
      ctx.fillStyle = grad
      ctx.fillRect(0, h * 0.35, w, h * 0.65)

      ctx.fillStyle = '#c9a84c'
      ctx.font = 'bold 28px Georgia, serif'
      ctx.fillText('ELLINES RATTAN', 48, h * 0.68)
      ctx.fillStyle = '#f5f0e6'
      ctx.font = 'bold 52px Georgia, serif'
      wrapText(ctx, poster.title, 48, h * 0.74, w - 96, 58)
      ctx.fillStyle = '#b8b8c0'
      ctx.font = '24px sans-serif'
      wrapText(ctx, poster.subtitle, 48, h * 0.82, w - 96, 32)
      ctx.fillStyle = '#c9a84c'
      ctx.font = 'bold 36px Georgia, serif'
      ctx.fillText(poster.price, 48, h * 0.92)
      ctx.fillStyle = '#fff'
      ctx.font = '22px sans-serif'
      ctx.fillText(poster.cta, 48, h * 0.96)

      const link = document.createElement('a')
      link.download = `ellines-poster-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('Poster downloaded')
    }
    img.onerror = () => showToast('Could not load poster image')
    img.src = poster.image
  }

  if (!user || user.role !== 'superadmin') {
    return (
      <div>
        <div className="admin-panel__head">
          <h1>Control Center</h1>
          <p>Super admin only — full site control, orders, pages, media, and marketing.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="god-mode">
      <div className="admin-panel__head">
        <div>
          <h1>Control Center</h1>
          <p>God mode — pages, orders, invoices, media, users, posters &amp; subscriptions.</p>
        </div>
      </div>

      <nav className="god-mode__tabs">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`god-mode__tab ${sub === t.id ? 'god-mode__tab--active' : ''}`}
            onClick={() => setSub(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {sub === 'overview' && (
        <div className="god-mode__stats">
          <div className="dash-stat"><div className="dash-stat__value">{stats.orders}</div><div className="dash-stat__label">Orders</div></div>
          <div className="dash-stat"><div className="dash-stat__value">{stats.pending}</div><div className="dash-stat__label">Pending</div></div>
          <div className="dash-stat"><div className="dash-stat__value">{stats.enquiries}</div><div className="dash-stat__label">Enquiries</div></div>
          <div className="dash-stat"><div className="dash-stat__value">{stats.subscribers}</div><div className="dash-stat__label">Subscribers</div></div>
          <div className="dash-stat"><div className="dash-stat__value">{stats.users}</div><div className="dash-stat__label">Portal users</div></div>
          <div className="dash-stat"><div className="dash-stat__value">{firebaseReady ? 'Live' : 'Local'}</div><div className="dash-stat__label">Firebase</div></div>
        </div>
      )}

      {sub === 'pages' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <PageCmsEditor
            pageKey={pageKey}
            onPageKeyChange={setPageKey}
            pageKeys={pageKeys}
            draft={pageDraft}
            onChange={setPageDraft}
            media={media}
            source={sitePagesSource}
            saving={saving}
            onSave={savePage}
            onReset={resetPage}
          />
        </div>
      )}

      {sub === 'orders' && (
        <div className="god-mode__split">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--dim)' }}>
              <h2 style={{ fontSize: '1.05rem' }}>Orders &amp; tracking ({orders.length})</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                      <td><strong>{o.orderNumber}</strong><div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{o.invoiceNumber}</div></td>
                      <td>{o.customer?.name}</td>
                      <td>{ORDER_STATUS_LABELS[o.status] || o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Create from enquiry</h3>
              <select
                className="field"
                value={enquiryPick}
                onChange={(e) => setEnquiryPick(e.target.value)}
              >
                <option value="" disabled>Select enquiry…</option>
                {enquiries.filter((e) => !orders.some((o) => o.enquiryId === e.id)).map((e) => (
                  <option key={e.id} value={e.id}>{e.customer?.name} — {getRequestTypeLabel(e.requestType)}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: 8 }}
                onClick={() => {
                  const enq = enquiries.find((e) => e.id === enquiryPick)
                  if (enq) {
                    handleCreateOrder(enq)
                    setEnquiryPick('')
                  }
                }}
              >
                Create order + invoice numbers
              </button>
            </div>
          </div>
          {selectedOrder ? (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2>{selectedOrder.orderNumber}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Invoice: {selectedOrder.invoiceNumber} · Receipt: {selectedOrder.receiptNumber}
              </p>
              <EnquiryItemsList items={selectedOrder.items || []} />
              <div className="form-group">
                <label>Status</label>
                <select
                  className="field"
                  value={selectedOrder.status}
                  onChange={(e) => handleOrderPatch({ status: e.target.value, trackingNote: `Status → ${ORDER_STATUS_LABELS[e.target.value]}` })}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Payment</label>
                <select
                  className="field"
                  value={selectedOrder.paymentStatus || 'unpaid'}
                  onChange={(e) => handleOrderPatch({ paymentStatus: e.target.value })}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Final total (KSh)</label>
                <input
                  type="number"
                  className="field"
                  value={finalTotalDraft}
                  onChange={(e) => setFinalTotalDraft(e.target.value)}
                  onBlur={() => {
                    const next = Number(finalTotalDraft) || 0
                    if (next !== (selectedOrder.finalTotal || 0)) {
                      handleOrderPatch({ finalTotal: next })
                    }
                  }}
                />
              </div>
              <div className="form-group">
                <label>Tracking note</label>
                <input
                  className="field"
                  placeholder="e.g. Left Nyeri workshop, ETA Friday"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleOrderPatch({ trackingNote: e.target.value })
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <button type="button" className="btn btn-primary" onClick={() => openInvoice(selectedOrder)}>Print invoice</button>
                <button type="button" className="btn btn-outline" onClick={() => openReceipt(selectedOrder)}>Print receipt</button>
              </div>
            </div>
          ) : (
            <div className="card dash-empty"><p>Select an order to manage tracking and documents.</p></div>
          )}
        </div>
      )}

      {sub === 'media' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="page-cms__list-head">
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>Media library</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                All site images plus Storage uploads. Use these when editing page heroes and cards.
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={importAllMedia} disabled={seedingMedia}>
              {seedingMedia ? 'Importing…' : 'Import all site images'}
            </button>
          </div>
          <div className="god-mode__media-grid">
            {media.map((m, i) => (
              <div key={m.id || m.src || i} className="god-mode__media-item">
                <img src={m.src} alt={m.alt || ''} loading="lazy" />
                <span>{m.alt || m.src}</span>
                {m.id && !String(m.id).startsWith('seed_') && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ margin: 6, padding: '4px 8px', fontSize: '0.72rem' }}
                    onClick={() => removeMedia(m)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <MediaAddForm onAdd={saveMediaItem} onUpload={uploadMedia} />
        </div>
      )}

      {sub === 'users' && (
        <div className="admin-table-wrap card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email || u.id}>
                  <td><strong>{u.name || '—'}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.kind || u.role}</td>
                  <td>{u.active === false ? 'Inactive' : 'Active'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sub === 'marketing' && (
        <div className="god-mode__split">
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2>Poster generator</h2>
            {Object.entries(poster).map(([key, val]) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input className="field" value={val} onChange={(e) => setPoster((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={downloadPoster}>Download poster PNG</button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2>Newsletter subscribers ({subscriptions.length})</h2>
            {subscriptions.length > 0 && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginBottom: 12 }}
                onClick={() => {
                  const csv = ['email,source,createdAt', ...subscriptions.map((s) =>
                    [s.email, s.source || '', s.createdAt?.toDate?.()?.toISOString?.() || s.createdAt || ''].join(','),
                  )].join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = `ellines-subscribers-${Date.now()}.csv`
                  a.click()
                }}
              >
                Export CSV
              </button>
            )}
            {subscriptions.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>Subscribers from the footer form appear here.</p>
            ) : (
              <ul style={{ listStyle: 'none', fontSize: '0.88rem' }}>
                {subscriptions.map((s) => (
                  <li key={s.id || s.email} style={{ padding: '6px 0', borderBottom: '1px solid var(--dim)' }}>
                    {s.email}
                    <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: '0.78rem' }}>{s.source || 'footer'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MediaAddForm({ onAdd, onUpload }) {
  const [form, setForm] = useState({ src: '', alt: '', category: 'Projects' })
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)

  return (
    <div style={{ marginTop: '1rem' }}>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!file || !onUpload) return
          setUploading(true)
          try {
            await onUpload(file, { alt: form.alt, category: form.category })
            setFile(null)
            setForm({ src: '', alt: '', category: 'Projects' })
            e.target.reset?.()
          } catch (err) {
            alert(err.message || 'Upload failed')
          }
          setUploading(false)
        }}
      >
        <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Upload image</h3>
        <div className="form-group">
          <label htmlFor="media-file">Image file</label>
          <input
            id="media-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="field"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="media-alt-up">Alt text</label>
          <input
            id="media-alt-up"
            className="field"
            value={form.alt}
            onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
          {uploading ? 'Uploading…' : 'Upload to Storage'}
        </button>
      </form>

      <form
        style={{ marginTop: '1.5rem' }}
        onSubmit={(e) => {
          e.preventDefault()
          onAdd(form)
          setForm({ src: '', alt: '', category: 'Projects' })
        }}
      >
        <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Or register path</h3>
        <div className="form-group">
          <label htmlFor="media-src">Image path</label>
          <input id="media-src" className="field" value={form.src} onChange={(e) => setForm((p) => ({ ...p, src: e.target.value }))} placeholder="/images/projects/…" required />
        </div>
        <div className="form-group">
          <label htmlFor="media-alt">Alt text</label>
          <input id="media-alt" className="field" value={form.alt} onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))} required />
        </div>
        <button type="submit" className="btn btn-outline">Add media path</button>
      </form>
    </div>
  )
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (let n = 0; n < words.length; n++) {
    const testLine = `${line}${words[n]} `
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, cy)
      line = `${words[n]} `
      cy += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, cy)
}
