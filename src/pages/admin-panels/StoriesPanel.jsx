import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { deletePost, savePost, slugifyPostTitle, subscribePosts, uploadCmsFile } from '../../utils/cms'

function emptyPost() {
  return {
    id: `p_new_${Date.now()}`,
    title: '',
    slug: '',
    excerpt: '',
    cover: '',
    body: '',
    published: false,
    publishedAt: null,
    sortOrder: 999,
  }
}

export default function StoriesPanel() {
  const { showToast, user } = useApp()
  const [posts, setPosts] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => subscribePosts(setPosts), [])

  const openNew = () => setEditing(emptyPost())
  const openEdit = (p) => setEditing({ ...p })
  const setField = (key, value) => setEditing((prev) => ({ ...prev, [key]: value }))

  const handleTitle = (title) => {
    setEditing((prev) => ({
      ...prev,
      title,
      slug: prev.id?.startsWith('p_new') || !prev.slug ? slugifyPostTitle(title) : prev.slug,
    }))
  }

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadCmsFile(file, { folder: 'posts', uploadedBy: user?.email })
      setField('cover', url)
      showToast('Cover uploaded')
    } catch (e) {
      showToast(e.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editing.title.trim() || !editing.slug.trim()) {
      showToast('Title and slug are required')
      return
    }
    setSaving(true)
    try {
      await savePost({
        ...editing,
        sortOrder: editing.id?.startsWith('p_new') ? posts.length : editing.sortOrder,
      })
      setEditing(null)
      showToast(editing.published ? 'Story published' : 'Story saved')
    } catch (err) {
      showToast(err.message || 'Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return
    try {
      await deletePost(id)
      showToast('Deleted')
      if (editing?.id === id) setEditing(null)
    } catch (e) {
      showToast(e.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Stories / Journal</h1>
          <p>Project stories and blog posts — public at /stories. Draft until published.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          New story
        </button>
      </div>

      {editing && (
        <form className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }} onSubmit={handleSave}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
            {editing.id?.startsWith('p_new') ? 'New story' : 'Edit story'}
          </h2>
          <div className="form-group">
            <label>Title *</label>
            <input className="field" value={editing.title} onChange={(e) => handleTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Slug * (URL path)</label>
            <input
              className="field"
              value={editing.slug}
              onChange={(e) => setField('slug', slugifyPostTitle(e.target.value) || e.target.value)}
              required
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
              Live URL: /stories/{editing.slug || '…'}
            </p>
          </div>
          <div className="form-group">
            <label>Excerpt</label>
            <textarea
              className="field"
              rows={2}
              value={editing.excerpt}
              onChange={(e) => setField('excerpt', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Cover image</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                className="field"
                style={{ flex: 1, minWidth: 200 }}
                value={editing.cover}
                onChange={(e) => setField('cover', e.target.value)}
              />
              <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
                {uploading ? 'Uploading…' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
            </div>
            {editing.cover && (
              <img src={editing.cover} alt="" style={{ marginTop: 8, maxHeight: 100, borderRadius: 6 }} />
            )}
          </div>
          <div className="form-group">
            <label>Body</label>
            <textarea
              className="field"
              rows={12}
              value={editing.body}
              onChange={(e) => setField('body', e.target.value)}
              placeholder="Paragraphs separated by blank lines"
            />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={Boolean(editing.published)}
              onChange={(e) => setField('published', e.target.checked)}
            />
            Published
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
            {editing.slug && editing.published && (
              <Link to={`/stories/${editing.slug}`} className="btn btn-outline" target="_blank" rel="noreferrer">
                View live
              </Link>
            )}
          </div>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[...posts]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((p) => (
                <tr key={p.id}>
                  <td>{p.cover ? <img src={p.cover} alt="" /> : '—'}</td>
                  <td>
                    <strong>{p.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {(p.excerpt || '').slice(0, 80)}
                      {(p.excerpt || '').length > 80 ? '…' : ''}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{p.slug}</td>
                  <td>{p.published ? 'Published' : 'Draft'}</td>
                  <td>
                    <button type="button" className="btn btn-outline" onClick={() => openEdit(p)}>
                      Edit
                    </button>{' '}
                    <button type="button" className="btn btn-outline" onClick={() => handleDelete(p.id)}>
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
