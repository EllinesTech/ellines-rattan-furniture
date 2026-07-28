import { useMemo, useState } from 'react'
import { PAGE_META } from '../../data/pages'
import { getDefaultPageContent } from '../../data/pageContentDefaults'

const HERO_FIELDS = [
  { key: 'title', label: 'Browser title (SEO)', multiline: false },
  { key: 'description', label: 'Meta description (SEO)', multiline: true },
  { key: 'eyebrow', label: 'Hero eyebrow', multiline: false },
  { key: 'heading', label: 'Hero heading', multiline: false },
  { key: 'sub', label: 'Hero subtitle', multiline: true },
  { key: 'heroImage', label: 'Hero image path', multiline: false, media: true },
  { key: 'heroPosition', label: 'Hero image position (e.g. center 40%)', multiline: false },
]

const PAGE_LABELS = {
  home: 'Home',
  craftsmanship: 'Craftsmanship',
  projects: 'Projects',
  services: 'Services',
  contact: 'Contact',
  about: 'About',
  aboutTeam: 'About · Team',
  aboutFounder: 'About · Founder',
  materials: 'Materials & Care',
  faq: 'FAQ',
  delivery: 'Delivery & Warranty',
  shop: 'Shop',
  quote: 'Quote',
  collections: 'Collections',
  hospitality: 'Hospitality & Trade',
  guide: 'Measurement Guide',
  visit: 'Book a Visit',
  catalogue: 'Catalogue',
  stories: 'Stories / Journal',
  financing: 'Financing',
  privacy: 'Privacy',
  terms: 'Terms',
  cookies: 'Cookies',
}

function emptyCard() {
  return { title: '', desc: '', image: '', category: '', care: '' }
}

export default function PageCmsEditor({
  pageKey,
  onPageKeyChange,
  pageKeys,
  draft,
  onChange,
  media = [],
  source,
  saving,
  onSave,
  onReset,
}) {
  const [tab, setTab] = useState('hero')
  const [pickerFor, setPickerFor] = useState(null)

  const content = draft.content || getDefaultPageContent(pageKey) || {}

  const setField = (key, value) => onChange({ ...draft, [key]: value })
  const setContent = (next) => onChange({ ...draft, content: next })

  const updateContent = (patch) => setContent({ ...content, ...patch })

  const introText = useMemo(
    () => (content.intro || []).join('\n\n'),
    [content.intro],
  )

  const applyIntro = (text) => {
    const intro = text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
    updateContent({ intro })
  }

  const cards = content.cards || []
  const faq = content.faq || []
  const bullets = content.bullets || []
  const trust = content.trust || []
  const warranty = content.warranty || []
  const ctas = content.ctas || []
  const ctaBand = content.ctaBand || {}

  return (
    <div className="page-cms">
      <div className="page-cms__toolbar">
        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <label htmlFor="cms-page-key">Page to edit</label>
          <select
            id="cms-page-key"
            className="field"
            value={pageKey}
            onChange={(e) => onPageKeyChange(e.target.value)}
          >
            {pageKeys.map((k) => (
              <option key={k} value={k}>{PAGE_LABELS[k] || k}</option>
            ))}
          </select>
          <p className="page-cms__hint">Source: {source} · Changes go live after Save</p>
        </div>
        <div className="page-cms__actions">
          <button type="button" className="btn btn-outline" onClick={onReset}>
            Reset to defaults
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </div>

      <nav className="god-mode__tabs" style={{ marginTop: 12 }}>
        {[
          { id: 'hero', label: 'SEO & Hero' },
          { id: 'body', label: 'Body copy' },
          { id: 'cards', label: 'Cards & images' },
          { id: 'lists', label: 'FAQ / lists' },
          { id: 'ctas', label: 'Buttons & CTAs' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`god-mode__tab ${tab === t.id ? 'god-mode__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'hero' && (
        <div className="page-cms__panel">
          {HERO_FIELDS.map((field) => (
            <div className="form-group" key={field.key}>
              <label htmlFor={`cms-${field.key}`}>{field.label}</label>
              {field.multiline ? (
                <textarea
                  id={`cms-${field.key}`}
                  className="field"
                  rows={3}
                  value={draft[field.key] || ''}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              ) : (
                <div className="page-cms__media-row">
                  <input
                    id={`cms-${field.key}`}
                    className="field"
                    value={draft[field.key] || ''}
                    onChange={(e) => setField(field.key, e.target.value)}
                  />
                  {field.media && (
                    <button type="button" className="btn btn-outline" onClick={() => setPickerFor(field.key)}>
                      Pick image
                    </button>
                  )}
                </div>
              )}
              {field.key === 'heroImage' && draft.heroImage && (
                <img src={draft.heroImage} alt="" className="page-cms__preview" />
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'body' && (
        <div className="page-cms__panel">
          <div className="form-group">
            <label htmlFor="cms-section-eyebrow">Section eyebrow</label>
            <input
              id="cms-section-eyebrow"
              className="field"
              value={content.sectionEyebrow || ''}
              onChange={(e) => updateContent({ sectionEyebrow: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-section-heading">Section heading</label>
            <input
              id="cms-section-heading"
              className="field"
              value={content.sectionHeading || ''}
              onChange={(e) => updateContent({ sectionHeading: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-section-sub">Section subtitle</label>
            <input
              id="cms-section-sub"
              className="field"
              value={content.sectionSub || ''}
              onChange={(e) => updateContent({ sectionSub: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-intro">Intro paragraphs (separate with a blank line)</label>
            <textarea
              id="cms-intro"
              className="field"
              rows={8}
              value={introText}
              onChange={(e) => applyIntro(e.target.value)}
              placeholder="First paragraph…

Second paragraph…"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-people-heading">People / band heading</label>
            <input
              id="cms-people-heading"
              className="field"
              value={content.peopleHeading || ''}
              onChange={(e) => updateContent({ peopleHeading: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-people-text">People / band text</label>
            <textarea
              id="cms-people-text"
              className="field"
              rows={3}
              value={content.peopleText || ''}
              onChange={(e) => updateContent({ peopleText: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-group-title">Group title</label>
            <input
              id="cms-group-title"
              className="field"
              value={content.groupTitle || ''}
              onChange={(e) => updateContent({ groupTitle: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-group-intro">Group intro</label>
            <textarea
              id="cms-group-intro"
              className="field"
              rows={3}
              value={content.groupIntro || ''}
              onChange={(e) => updateContent({ groupIntro: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-quote">Quote</label>
            <textarea
              id="cms-quote"
              className="field"
              rows={2}
              value={content.quote || ''}
              onChange={(e) => updateContent({ quote: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cms-quote-author">Quote author</label>
            <input
              id="cms-quote-author"
              className="field"
              value={content.quoteAuthor || ''}
              onChange={(e) => updateContent({ quoteAuthor: e.target.value })}
            />
          </div>
        </div>
      )}

      {tab === 'cards' && (
        <div className="page-cms__panel">
          <div className="page-cms__list-head">
            <h3>Content cards</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => updateContent({ cards: [...cards, emptyCard()] })}
            >
              + Add card
            </button>
          </div>
          {cards.length === 0 && <p className="page-cms__hint">No cards on this page yet.</p>}
          {cards.map((card, idx) => (
            <div key={idx} className="page-cms__card-editor card" style={{ padding: '1rem', marginBottom: 12 }}>
              <div className="page-cms__list-head">
                <strong>Card {idx + 1}</strong>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => updateContent({ cards: cards.filter((_, i) => i !== idx) })}
                >
                  Remove
                </button>
              </div>
              {['title', 'desc', 'category', 'care', 'image'].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field}</label>
                  {field === 'desc' || field === 'care' ? (
                    <textarea
                      className="field"
                      rows={2}
                      value={card[field] || ''}
                      onChange={(e) => {
                        const next = cards.map((c, i) => (i === idx ? { ...c, [field]: e.target.value } : c))
                        updateContent({ cards: next })
                      }}
                    />
                  ) : (
                    <div className="page-cms__media-row">
                      <input
                        className="field"
                        value={card[field] || ''}
                        onChange={(e) => {
                          const next = cards.map((c, i) => (i === idx ? { ...c, [field]: e.target.value } : c))
                          updateContent({ cards: next })
                        }}
                      />
                      {field === 'image' && (
                        <button type="button" className="btn btn-outline" onClick={() => setPickerFor(`card:${idx}`)}>
                          Pick
                        </button>
                      )}
                    </div>
                  )}
                  {field === 'image' && card.image && (
                    <img src={card.image} alt="" className="page-cms__preview" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'lists' && (
        <div className="page-cms__panel">
          <div className="form-group">
            <label htmlFor="cms-bullets">Bullet list (one per line)</label>
            <textarea
              id="cms-bullets"
              className="field"
              rows={6}
              value={bullets.join('\n')}
              onChange={(e) =>
                updateContent({
                  bullets: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                })
              }
            />
          </div>

          <div className="page-cms__list-head">
            <h3>Trust row</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => updateContent({ trust: [...trust, { title: '', desc: '' }] })}
            >
              + Add
            </button>
          </div>
          {trust.map((item, idx) => (
            <div key={idx} className="page-cms__media-row" style={{ marginBottom: 8 }}>
              <input
                className="field"
                placeholder="Title"
                value={item.title || ''}
                onChange={(e) => {
                  const next = trust.map((t, i) => (i === idx ? { ...t, title: e.target.value } : t))
                  updateContent({ trust: next })
                }}
              />
              <input
                className="field"
                placeholder="Description"
                value={item.desc || ''}
                onChange={(e) => {
                  const next = trust.map((t, i) => (i === idx ? { ...t, desc: e.target.value } : t))
                  updateContent({ trust: next })
                }}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => updateContent({ trust: trust.filter((_, i) => i !== idx) })}
              >
                ✕
              </button>
            </div>
          ))}

          <div className="page-cms__list-head" style={{ marginTop: 16 }}>
            <h3>FAQ items</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => updateContent({ faq: [...faq, { q: '', a: '' }] })}
            >
              + Add FAQ
            </button>
          </div>
          {faq.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem', marginBottom: 10 }}>
              <input
                className="field"
                placeholder="Question"
                value={item.q || ''}
                style={{ marginBottom: 8 }}
                onChange={(e) => {
                  const next = faq.map((f, i) => (i === idx ? { ...f, q: e.target.value } : f))
                  updateContent({ faq: next })
                }}
              />
              <textarea
                className="field"
                rows={3}
                placeholder="Answer"
                value={item.a || ''}
                onChange={(e) => {
                  const next = faq.map((f, i) => (i === idx ? { ...f, a: e.target.value } : f))
                  updateContent({ faq: next })
                }}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: 8 }}
                onClick={() => updateContent({ faq: faq.filter((_, i) => i !== idx) })}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="page-cms__list-head" style={{ marginTop: 16 }}>
            <h3>Warranty / extra list</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => updateContent({ warranty: [...warranty, { title: '', desc: '' }] })}
            >
              + Add
            </button>
          </div>
          {warranty.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: '1rem', marginBottom: 10 }}>
              <input
                className="field"
                placeholder="Title"
                value={item.title || ''}
                style={{ marginBottom: 8 }}
                onChange={(e) => {
                  const next = warranty.map((w, i) => (i === idx ? { ...w, title: e.target.value } : w))
                  updateContent({ warranty: next })
                }}
              />
              <textarea
                className="field"
                rows={2}
                placeholder="Description"
                value={item.desc || ''}
                onChange={(e) => {
                  const next = warranty.map((w, i) => (i === idx ? { ...w, desc: e.target.value } : w))
                  updateContent({ warranty: next })
                }}
              />
            </div>
          ))}
        </div>
      )}

      {tab === 'ctas' && (
        <div className="page-cms__panel">
          <div className="page-cms__list-head">
            <h3>Hero buttons</h3>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                updateContent({
                  ctas: [...ctas, { label: 'New button', to: '/', variant: 'outline' }],
                })
              }
            >
              + Add button
            </button>
          </div>
          {ctas.map((cta, idx) => (
            <div key={idx} className="page-cms__media-row" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                className="field"
                placeholder="Label"
                value={cta.label || ''}
                onChange={(e) => {
                  const next = ctas.map((c, i) => (i === idx ? { ...c, label: e.target.value } : c))
                  updateContent({ ctas: next })
                }}
              />
              <input
                className="field"
                placeholder="Path /to or leave blank"
                value={cta.to || ''}
                onChange={(e) => {
                  const next = ctas.map((c, i) => (i === idx ? { ...c, to: e.target.value } : c))
                  updateContent({ ctas: next })
                }}
              />
              <select
                className="field"
                value={cta.variant || 'outline'}
                onChange={(e) => {
                  const next = ctas.map((c, i) => (i === idx ? { ...c, variant: e.target.value } : c))
                  updateContent({ ctas: next })
                }}
              >
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
                <option value="wa">WhatsApp</option>
              </select>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => updateContent({ ctas: ctas.filter((_, i) => i !== idx) })}
              >
                ✕
              </button>
            </div>
          ))}

          <h3 style={{ marginTop: 20 }}>Bottom CTA band</h3>
          {['heading', 'sub', 'primaryLabel', 'primaryTo', 'secondaryLabel', 'secondaryTo'].map((field) => (
            <div className="form-group" key={field}>
              <label>{field}</label>
              <input
                className="field"
                value={ctaBand[field] || ''}
                onChange={(e) => updateContent({ ctaBand: { ...ctaBand, [field]: e.target.value } })}
              />
            </div>
          ))}
        </div>
      )}

      {pickerFor && (
        <div className="page-cms__picker" role="dialog" aria-label="Pick image">
          <div className="page-cms__picker-inner card">
            <div className="page-cms__list-head">
              <h3>Choose from media library</h3>
              <button type="button" className="btn btn-outline" onClick={() => setPickerFor(null)}>
                Close
              </button>
            </div>
            <div className="god-mode__media-grid">
              {media.map((m) => (
                <button
                  key={m.id || m.src}
                  type="button"
                  className="god-mode__media-item"
                  style={{ cursor: 'pointer', textAlign: 'left', background: 'transparent', border: '1px solid var(--dim)' }}
                  onClick={() => {
                    if (pickerFor === 'heroImage') {
                      setField('heroImage', m.src)
                    } else if (String(pickerFor).startsWith('card:')) {
                      const idx = Number(String(pickerFor).split(':')[1])
                      const next = cards.map((c, i) => (i === idx ? { ...c, image: m.src } : c))
                      updateContent({ cards: next })
                    }
                    setPickerFor(null)
                  }}
                >
                  <img src={m.src} alt={m.alt || ''} loading="lazy" />
                  <span>{m.alt || m.src}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function buildPageDraft(pageKey, sitePages) {
  const base = PAGE_META[pageKey] || PAGE_META.home
  const saved = sitePages?.[pageKey] || {}
  const content = {
    ...getDefaultPageContent(pageKey),
    ...(saved.content || {}),
  }
  return { ...base, ...saved, content }
}
