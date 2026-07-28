import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { DEFAULT_PAGE_CONTENT } from '../../data/seedPageContent'
import { loadPageContent, mergePageContent, savePageContent, uploadCmsFile } from '../../utils/cms'

function emptySection() {
  return { title: '', body: '' }
}

export default function SiteExtrasPanel() {
  const { user, showToast, isSuperAdmin } = useApp()
  const [form, setForm] = useState(() => mergePageContent(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPageContent().then((data) => {
      setForm(data)
      setLoading(false)
    })
  }, [])

  const setRoot = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const setFinancing = (patch) =>
    setForm((prev) => ({ ...prev, financing: { ...prev.financing, ...patch } }))
  const setTrade = (patch) => setForm((prev) => ({ ...prev, trade: { ...prev.trade, ...patch } }))

  const updateSection = (index, patch) => {
    setFinancing({
      sections: form.financing.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    })
  }

  const handleUploadPdf = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadCmsFile(file, { folder: 'brochure', uploadedBy: user?.email })
      setRoot('brochurePdfUrl', url)
      showToast('PDF uploaded')
    } catch (e) {
      showToast(e.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = await savePageContent(form, user?.email)
      setForm(saved)
      showToast('Site extras saved — live on the site')
    } catch (err) {
      showToast(err.message || 'Save failed')
    }
    setSaving(false)
  }

  const handleResetFinancing = () => {
    if (!window.confirm('Reset financing copy to defaults?')) return
    setFinancing({ ...DEFAULT_PAGE_CONTENT.financing })
  }

  if (loading) {
    return (
      <div>
        <div className="admin-panel__head">
          <h1>Site extras</h1>
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Site extras</h1>
          <p>
            Brochure PDF, calendar booking URL, financing page, and trade form copy.
            {isSuperAdmin ? '' : ' Admins with CMS permission can edit these.'}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save all'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Catalogue PDF</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            When set, the Catalogue page shows a Download PDF button. Leave empty to keep browser print fallback.
          </p>
          <div className="form-group">
            <label>PDF URL</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                className="field"
                style={{ flex: 1, minWidth: 220 }}
                value={form.brochurePdfUrl || ''}
                onChange={(e) => setRoot('brochurePdfUrl', e.target.value)}
                placeholder="https://… or upload"
              />
              <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                {uploading ? 'Uploading…' : 'Upload PDF'}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  hidden
                  disabled={uploading}
                  onChange={(e) => handleUploadPdf(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Calendar booking</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Optional Calendly (or similar) URL on the Visit page. In-app date/time bookings are always saved to Firestore.
          </p>
          <div className="form-group">
            <label>External calendar URL</label>
            <input
              className="field"
              type="url"
              value={form.calendlyUrl || ''}
              onChange={(e) => setRoot('calendlyUrl', e.target.value)}
              placeholder="https://calendly.com/…"
            />
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Financing page</h2>
            <button type="button" className="btn btn-outline" onClick={handleResetFinancing}>
              Reset defaults
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Eyebrow</label>
              <input
                className="field"
                value={form.financing.eyebrow || ''}
                onChange={(e) => setFinancing({ eyebrow: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Heading</label>
              <input
                className="field"
                value={form.financing.heading || ''}
                onChange={(e) => setFinancing({ heading: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Intro (paragraphs, blank line separated)</label>
            <textarea
              className="field"
              rows={4}
              value={(form.financing.intro || []).join('\n\n')}
              onChange={(e) =>
                setFinancing({
                  intro: e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>

          <h3 style={{ fontSize: '0.95rem', margin: '1rem 0 0.5rem' }}>Sections</h3>
          {(form.financing.sections || []).map((section, i) => (
            <div key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12, marginBottom: 12 }}>
              <div className="form-group">
                <label>Section title</label>
                <input
                  className="field"
                  value={section.title}
                  onChange={(e) => updateSection(i, { title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea
                  className="field"
                  rows={3}
                  value={section.body}
                  onChange={(e) => updateSection(i, { body: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setFinancing({
                    sections: form.financing.sections.filter((_, j) => j !== i),
                  })
                }
              >
                Remove section
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginBottom: 12 }}
            onClick={() =>
              setFinancing({ sections: [...(form.financing.sections || []), emptySection()] })
            }
          >
            Add section
          </button>

          <div className="form-group">
            <label>Footer note</label>
            <textarea
              className="field"
              rows={2}
              value={form.financing.note || ''}
              onChange={(e) => setFinancing({ note: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Primary CTA label</label>
              <input
                className="field"
                value={form.financing.ctaLabel || ''}
                onChange={(e) => setFinancing({ ctaLabel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Primary CTA path</label>
              <input
                className="field"
                value={form.financing.ctaTo || ''}
                onChange={(e) => setFinancing({ ctaTo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Secondary CTA label</label>
              <input
                className="field"
                value={form.financing.secondaryLabel || ''}
                onChange={(e) => setFinancing({ secondaryLabel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Secondary CTA path</label>
              <input
                className="field"
                value={form.financing.secondaryTo || ''}
                onChange={(e) => setFinancing({ secondaryTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Trade form copy</h2>
          <div className="form-group">
            <label>Form intro</label>
            <textarea
              className="field"
              rows={2}
              value={form.trade.formIntro || ''}
              onChange={(e) => setTrade({ formIntro: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Samples field label</label>
            <input
              className="field"
              value={form.trade.sampleNoteLabel || ''}
              onChange={(e) => setTrade({ sampleNoteLabel: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Samples placeholder</label>
            <input
              className="field"
              value={form.trade.sampleNotePlaceholder || ''}
              onChange={(e) => setTrade({ sampleNotePlaceholder: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save all'}
        </button>
      </form>
    </div>
  )
}
