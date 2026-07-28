import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  DEFAULT_FRAME_OPTIONS,
  formatFrameOptionsInput,
  parseFrameOptionsInput,
  WEAVE_MATERIAL,
} from '../../data/productOptions'
import { formatKes } from '../../utils/auth'

export default function ProductsPanel() {
  const { products, saveProducts, productsSource } = useApp()
  const [draft, setDraft] = useState(() => products.map((p) => ({ ...p })))
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  const updateRow = (id, patch) => {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const normalized = draft.map((p) => ({
        ...p,
        startingPrice: p.quoteOnly ? null : Number(p.startingPrice) || null,
        weaveMaterial: p.weaveMaterial || WEAVE_MATERIAL,
        frameOptions: parseFrameOptionsInput(
          typeof p.frameOptionsText === 'string'
            ? p.frameOptionsText
            : formatFrameOptionsInput(p.frameOptions || DEFAULT_FRAME_OPTIONS),
        ),
      }))
      await saveProducts(normalized)
      setDraft(normalized.map((p) => ({ ...p })))
      showToast('Products saved')
    } catch (e) {
      showToast(`Save failed: ${e.message}`)
    }
    setSaving(false)
  }

  const syncFromLive = () => {
    setDraft(products.map((p) => ({ ...p })))
    showToast('Reloaded from catalogue')
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Products</h1>
          <p>
            {draft.length} items · source: {productsSource}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" onClick={syncFromLive}>
            Reload
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Starting price</th>
              <th>Frame options</th>
              <th>Quote only</th>
              <th>Active</th>
              <th>Featured</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.src ? <img src={product.src} alt="" /> : '—'}
                </td>
                <td>
                  <input
                    type="text"
                    value={product.title}
                    onChange={(e) => updateRow(product.id, { title: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={product.category}
                    onChange={(e) => updateRow(product.id, { category: e.target.value })}
                  />
                </td>
                <td>
                  {product.quoteOnly ? (
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Quote only</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={product.startingPrice ?? ''}
                      onChange={(e) =>
                        updateRow(product.id, { startingPrice: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    title="Comma-separated frame materials"
                    placeholder="Metal, Aluminium, Wood"
                    value={
                      product.frameOptionsText ??
                      formatFrameOptionsInput(product.frameOptions || DEFAULT_FRAME_OPTIONS)
                    }
                    onChange={(e) => updateRow(product.id, { frameOptionsText: e.target.value })}
                    style={{ minWidth: 160 }}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.quoteOnly}
                    onChange={(e) =>
                      updateRow(product.id, {
                        quoteOnly: e.target.checked,
                        startingPrice: e.target.checked ? null : product.startingPrice,
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.active}
                    onChange={(e) => updateRow(product.id, { active: e.target.checked })}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={(e) => updateRow(product.id, { featured: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--muted)' }}>
        Weave is {WEAVE_MATERIAL} site-wide. Frame options are comma-separated labels (price additives stay at 0
        unless set in data). Starting prices display as {formatKes(125000)} — final quotes vary by frame and finish.
      </p>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  )
}
