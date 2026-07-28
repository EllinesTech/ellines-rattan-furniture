import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { formatKes } from '../../utils/auth'

export default function ServicesPanel() {
  const { siteContent, siteContentSource, saveSiteContent } = useApp()
  const [services, setServices] = useState([])
  const [pricing, setPricing] = useState({ note: '', deliveryNote: '', tiers: [] })
  const [budgetTiers, setBudgetTiers] = useState([])
  const [budgetNote, setBudgetNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setServices(siteContent.services.map((s) => ({ ...s, pricing: { ...s.pricing } })))
    setPricing(JSON.parse(JSON.stringify(siteContent.servicePricing)))
    setBudgetTiers(siteContent.budgetTiers.map((t) => ({ ...t })))
    setBudgetNote(siteContent.budgetNote || '')
  }, [siteContent])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const updateService = (index, patch) => {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const updateServicePrice = (index, field, value) => {
    setServices((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, pricing: { ...s.pricing, [field]: value } } : s,
      ),
    )
  }

  const updateTierItem = (groupIdx, itemIdx, patch) => {
    setPricing((prev) => {
      const tiers = prev.tiers.map((t, gi) =>
        gi === groupIdx
          ? { ...t, items: t.items.map((item, ii) => (ii === itemIdx ? { ...item, ...patch } : item)) }
          : t,
      )
      return { ...prev, tiers }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const normalizedServices = services.map((s) => ({
        ...s,
        pricing: {
          ...s.pricing,
          amount: s.pricing?.type === 'quote' ? undefined : Number(s.pricing?.amount) || 0,
        },
      }))
      await saveSiteContent({
        services: normalizedServices,
        servicePricing: pricing,
        budgetTiers,
        budgetNote,
      })
      showToast('Services & pricing saved')
    } catch (e) {
      showToast(`Save failed: ${e.message}`)
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Services &amp; pricing</h1>
          <p>Edit service cards, pricing guide, and budget tiers · source: {siteContentSource}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Pricing guide notes</h2>
        <div className="form-group">
          <label htmlFor="pricing-note">Main note</label>
          <textarea
            id="pricing-note"
            className="field"
            rows={2}
            value={pricing.note || ''}
            onChange={(e) => setPricing((p) => ({ ...p, note: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="delivery-note">Delivery note</label>
          <input
            id="delivery-note"
            className="field"
            value={pricing.deliveryNote || ''}
            onChange={(e) => setPricing((p) => ({ ...p, deliveryNote: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="budget-note">Budget-friendly message</label>
          <textarea
            id="budget-note"
            className="field"
            rows={2}
            value={budgetNote}
            onChange={(e) => setBudgetNote(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Service cards</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price type</th>
              <th>Amount (KSh)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, i) => (
              <tr key={service.title}>
                <td>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => updateService(i, { title: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    value={service.pricing?.type || 'from'}
                    onChange={(e) => updateServicePrice(i, 'type', e.target.value)}
                  >
                    <option value="from">From</option>
                    <option value="fee">Fixed fee</option>
                    <option value="quote">Quote only</option>
                  </select>
                </td>
                <td>
                  {service.pricing?.type === 'quote' ? (
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>—</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={service.pricing?.amount ?? ''}
                      onChange={(e) => updateServicePrice(i, 'amount', e.target.value ? Number(e.target.value) : 0)}
                    />
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) => updateService(i, { description: e.target.value })}
                    style={{ minWidth: 200 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pricing.tiers?.map((tier, gi) => (
        <div key={tier.group} className="admin-table-wrap" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>{tier.group}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price (KSh)</th>
                <th>Type</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {tier.items.map((item, ii) => (
                <tr key={item.name}>
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateTierItem(gi, ii, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    {item.type === 'quote' ? (
                      <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Quote</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.price ?? ''}
                        onChange={(e) => updateTierItem(gi, ii, { price: e.target.value ? Number(e.target.value) : null })}
                      />
                    )}
                  </td>
                  <td>
                    <select
                      value={item.type}
                      onChange={(e) => updateTierItem(gi, ii, { type: e.target.value, price: e.target.value === 'quote' ? null : item.price })}
                    >
                      <option value="from">From</option>
                      <option value="fee">Fee</option>
                      <option value="quote">Quote</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.detail || ''}
                      onChange={(e) => updateTierItem(gi, ii, { detail: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="admin-table-wrap">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Client budget tiers</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Range display</th>
              <th>Guide note</th>
            </tr>
          </thead>
          <tbody>
            {budgetTiers.map((tier, i) => (
              <tr key={tier.id}>
                <td>
                  <input
                    type="text"
                    value={tier.label}
                    onChange={(e) => setBudgetTiers((prev) => prev.map((t, j) => (j === i ? { ...t, label: e.target.value } : t)))}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={tier.range}
                    onChange={(e) => setBudgetTiers((prev) => prev.map((t, j) => (j === i ? { ...t, range: e.target.value } : t)))}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={tier.note || ''}
                    onChange={(e) => setBudgetTiers((prev) => prev.map((t, j) => (j === i ? { ...t, note: e.target.value } : t)))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--muted)' }}>
        Preview: armchairs from {formatKes(45000)} · repairs from {formatKes(6500)}
      </p>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
