import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  deleteTestimonial,
  saveTestimonial,
  subscribeTestimonials,
  uploadCmsFile,
} from '../../utils/cms'

function emptyItem() {
  return {
    id: `t_new_${Date.now()}`,
    quote: '',
    name: '',
    role: '',
    rating: 5,
    photo: '',
    beforePhoto: '',
    afterPhoto: '',
    sortOrder: 999,
    active: true,
  }
}

export default function TestimonialsPanel() {
  const { showToast, user } = useApp()
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')

  useEffect(() => subscribeTestimonials(setItems), [])

  const openNew = () => setEditing(emptyItem())
  const openEdit = (item) => setEditing({ ...item })

  const setField = (key, value) => setEditing((prev) => ({ ...prev, [key]: value }))

  const handleUpload = async (field, file) => {
    if (!file) return
    setUploading(field)
    try {
      const { url } = await uploadCmsFile(file, { folder: 'testimonials', uploadedBy: user?.email })
      setField(field, url)
      showToast('Image uploaded')
    } catch (e) {
      showToast(e.message || 'Upload failed')
    }
    setUploading('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editing.quote.trim() || !editing.name.trim()) {
      showToast('Quote and name are required')
      return
    }
    setSaving(true)
    try {
      const sorted = [...items]
      const payload = {
        ...editing,
        sortOrder: editing.id?.startsWith('t_new') ? items.length : editing.sortOrder,
      }
      await saveTestimonial(payload)
      setEditing(null)
      showToast('Testimonial saved')
      // local refresh handled by snapshot; for offline, nudge:
      if (!sorted.find((t) => t.id === payload.id)) {
        setItems((prev) => [...prev, payload])
      }
    } catch (err) {
      showToast(err.message || 'Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      await deleteTestimonial(id)
      showToast('Deleted')
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      showToast(e.message || 'Delete failed')
    }
  }

  const move = async (id, dir) => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex((t) => t.id === id)
    const swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swap]
    try {
      await saveTestimonial({ ...a, sortOrder: b.sortOrder })
      await saveTestimonial({ ...b, sortOrder: a.sortOrder })
      showToast('Order updated')
    } catch (e) {
      showToast(e.message || 'Reorder failed')
    }
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Testimonials</h1>
          <p>Photo testimonials and optional before / after pairs — shown on the homepage.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Add testimonial
        </button>
      </div>

      {editing && (
        <form className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }} onSubmit={handleSave}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
            {editing.id?.startsWith('t_new') ? 'New testimonial' : 'Edit testimonial'}
          </h2>
          <div className="form-group">
            <label>Quote *</label>
            <textarea
              className="field"
              rows={3}
              value={editing.quote}
              onChange={(e) => setField('quote', e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 12 }}>
            <div className="form-group">
              <label>Name *</label>
              <input className="field" value={editing.name} onChange={(e) => setField('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Role / location</label>
              <input className="field" value={editing.role} onChange={(e) => setField('role', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <input
                className="field"
                type="number"
                min={1}
                max={5}
                value={editing.rating}
                onChange={(e) => setField('rating', Number(e.target.value))}
              />
            </div>
          </div>

          {[
            { key: 'photo', label: 'Main photo (URL or upload)' },
            { key: 'beforePhoto', label: 'Before photo (optional)' },
            { key: 'afterPhoto', label: 'After photo (optional)' },
          ].map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  className="field"
                  style={{ flex: 1, minWidth: 200 }}
                  value={editing[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder="/images/... or https://"
                />
                <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                  {uploading === key ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={Boolean(uploading)}
                    onChange={(e) => handleUpload(key, e.target.files?.[0])}
                  />
                </label>
              </div>
              {editing[key] && (
                <img src={editing[key]} alt="" style={{ marginTop: 8, maxHeight: 80, borderRadius: 6 }} />
              )}
            </div>
          ))}

          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={editing.active !== false}
              onChange={(e) => setField('active', e.target.checked)}
            />
            Active (visible on site)
          </label>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Quote</th>
              <th>Active</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[...items]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <tr key={item.id}>
                  <td>{item.photo ? <img src={item.photo} alt="" /> : '—'}</td>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.role}</div>
                  </td>
                  <td style={{ maxWidth: 280, fontSize: '0.85rem' }}>
                    {item.quote.slice(0, 100)}
                    {item.quote.length > 100 ? '…' : ''}
                    {(item.beforePhoto || item.afterPhoto) && (
                      <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Before/after set</div>
                    )}
                  </td>
                  <td>{item.active !== false ? 'Yes' : 'No'}</td>
                  <td>
                    <button type="button" className="btn btn-outline" style={{ padding: '2px 8px' }} onClick={() => move(item.id, -1)}>
                      ↑
                    </button>{' '}
                    <button type="button" className="btn btn-outline" style={{ padding: '2px 8px' }} onClick={() => move(item.id, 1)}>
                      ↓
                    </button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline" onClick={() => openEdit(item)}>
                      Edit
                    </button>{' '}
                    <button type="button" className="btn btn-outline" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
