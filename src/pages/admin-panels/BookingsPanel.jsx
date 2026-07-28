import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUSES,
  TRADE_STATUS_LABELS,
  TRADE_STATUSES,
} from '../../data/seedPageContent'
import {
  subscribeTradeEnquiries,
  subscribeVisitBookings,
  updateTradeEnquiry,
  updateVisitBooking,
} from '../../utils/cms'
import { fmtEnquiryDate } from '../../utils/enquiries'

const PURPOSE_LABELS = {
  showroom: 'Nairobi showroom',
  consultation: 'Paid consultation',
  nyeri: 'Nyeri atelier',
  site: 'Site / space',
}

export default function BookingsPanel() {
  const { showToast } = useApp()
  const [tab, setTab] = useState('visits')
  const [bookings, setBookings] = useState([])
  const [trade, setTrade] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const u1 = subscribeVisitBookings(setBookings)
    const u2 = subscribeTradeEnquiries(setTrade)
    return () => {
      u1?.()
      u2?.()
    }
  }, [])

  const unreadVisits = bookings.filter((b) => !b.read).length
  const unreadTrade = trade.filter((t) => !t.read).length

  const openBooking = async (item) => {
    setSelected({ kind: 'visit', ...item })
    if (!item.read) {
      try {
        await updateVisitBooking(item.id, { read: true })
      } catch {
        /* ignore */
      }
    }
  }

  const openTrade = async (item) => {
    setSelected({ kind: 'trade', ...item })
    if (!item.read) {
      try {
        await updateTradeEnquiry(item.id, { read: true })
      } catch {
        /* ignore */
      }
    }
  }

  const setStatus = async (status) => {
    if (!selected) return
    try {
      if (selected.kind === 'visit') {
        await updateVisitBooking(selected.id, { status })
      } else {
        await updateTradeEnquiry(selected.id, { status })
      }
      setSelected((prev) => ({ ...prev, status }))
      showToast('Status updated')
    } catch (e) {
      showToast(e.message || 'Update failed')
    }
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Bookings &amp; Trade</h1>
          <p>Visit bookings and designer / hospitality trade enquiries.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${tab === 'visits' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setTab('visits')
            setSelected(null)
          }}
        >
          Visit bookings {unreadVisits > 0 ? `(${unreadVisits})` : ''}
        </button>
        <button
          type="button"
          className={`btn ${tab === 'trade' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            setTab('trade')
            setSelected(null)
          }}
        >
          Trade enquiries {unreadTrade > 0 ? `(${unreadTrade})` : ''}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>
        <div className="admin-table-wrap">
          {tab === 'visits' ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Name</th>
                  <th>Preferred</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ color: 'var(--muted)' }}>
                      No visit bookings yet.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    style={{ cursor: 'pointer', fontWeight: b.read ? 400 : 600 }}
                    onClick={() => openBooking(b)}
                  >
                    <td>{fmtEnquiryDate(b.createdAt, true)}</td>
                    <td>
                      {b.name}
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{b.phone}</div>
                    </td>
                    <td>
                      {b.preferredDate || '—'} {b.preferredTime || ''}
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {PURPOSE_LABELS[b.purpose] || b.purpose}
                      </div>
                    </td>
                    <td>{BOOKING_STATUS_LABELS[b.status] || b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Name / company</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trade.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ color: 'var(--muted)' }}>
                      No trade enquiries yet.
                    </td>
                  </tr>
                )}
                {trade.map((t) => (
                  <tr
                    key={t.id}
                    style={{ cursor: 'pointer', fontWeight: t.read ? 400 : 600 }}
                    onClick={() => openTrade(t)}
                  >
                    <td>{fmtEnquiryDate(t.createdAt, true)}</td>
                    <td>
                      {t.name}
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {t.company || t.phone}
                      </div>
                    </td>
                    <td>{t.projectType}</td>
                    <td>{TRADE_STATUS_LABELS[t.status] || t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div className="card" style={{ padding: '1.25rem', alignSelf: 'start' }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>
              {selected.kind === 'visit' ? 'Visit booking' : 'Trade enquiry'}
            </h2>
            <dl style={{ display: 'grid', gap: 8, fontSize: '0.9rem', marginBottom: '1rem' }}>
              <div>
                <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Name</dt>
                <dd>{selected.name}</dd>
              </div>
              {selected.company && (
                <div>
                  <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Company</dt>
                  <dd>{selected.company}</dd>
                </div>
              )}
              <div>
                <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Phone</dt>
                <dd>
                  <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                </dd>
              </div>
              {selected.email && (
                <div>
                  <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Email</dt>
                  <dd>
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  </dd>
                </div>
              )}
              {selected.kind === 'visit' && (
                <>
                  <div>
                    <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Purpose</dt>
                    <dd>{PURPOSE_LABELS[selected.purpose] || selected.purpose}</dd>
                  </div>
                  <div>
                    <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Preferred slot</dt>
                    <dd>
                      {selected.preferredDate || '—'} · {selected.preferredTime || 'flexible'}
                    </dd>
                  </div>
                </>
              )}
              {selected.kind === 'trade' && (
                <>
                  <div>
                    <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Project type</dt>
                    <dd>{selected.projectType}</dd>
                  </div>
                  {selected.samplesNote && (
                    <div>
                      <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Samples / drawings</dt>
                      <dd>{selected.samplesNote}</dd>
                    </div>
                  )}
                </>
              )}
              {(selected.notes || selected.message) && (
                <div>
                  <dt style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Notes</dt>
                  <dd style={{ whiteSpace: 'pre-wrap' }}>{selected.notes || selected.message}</dd>
                </div>
              )}
            </dl>

            <div className="form-group">
              <label>Status</label>
              <select
                className="field"
                value={selected.status || 'new'}
                onChange={(e) => setStatus(e.target.value)}
              >
                {(selected.kind === 'visit' ? BOOKING_STATUSES : TRADE_STATUSES).map((s) => (
                  <option key={s} value={s}>
                    {(selected.kind === 'visit' ? BOOKING_STATUS_LABELS : TRADE_STATUS_LABELS)[s]}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="btn btn-outline" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
