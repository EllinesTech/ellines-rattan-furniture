import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  ALL_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  PERMISSION_LABELS,
  createAdminAccount,
  listAdminAccounts,
  removeAdminAccount,
  updateAdminAccount,
} from '../../utils/auth'
import { getRoleLabel } from '../../utils/roles'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  permissions: [...DEFAULT_ADMIN_PERMISSIONS],
}

export default function AdminsPanel() {
  const { user, isSuperAdmin } = useApp()
  const [admins, setAdmins] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [editPerms, setEditPerms] = useState([])
  const [editPassword, setEditPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAdmins = async () => {
    setLoading(true)
    const list = await listAdminAccounts()
    setAdmins(list.filter((a) => a.role !== 'superadmin'))
    setLoading(false)
  }

  useEffect(() => {
    if (isSuperAdmin) loadAdmins()
  }, [isSuperAdmin])

  if (!isSuperAdmin) {
    return (
      <div>
        <div className="admin-panel__head">
          <h1>Admin accounts</h1>
          <p>Only the super admin can create and manage admin accounts.</p>
        </div>
      </div>
    )
  }

  const togglePerm = (list, perm, setter) => {
    setter(list.includes(perm) ? list.filter((p) => p !== perm) : [...list, perm])
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email, and password are required.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    try {
      await createAdminAccount(form, user)
      setForm(EMPTY_FORM)
      setMessage('Admin account created. They can sign in at the team login page.')
      await loadAdmins()
    } catch (err) {
      setError(err.message || 'Could not create admin account.')
    }
    setSubmitting(false)
  }

  const handleUpdatePerms = async (email) => {
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const patch = { permissions: editPerms }
      if (editPassword && editPassword.length >= 6) patch.password = editPassword
      await updateAdminAccount(email, patch, user)
      setEditing(null)
      setEditPassword('')
      setMessage('Admin permissions updated.')
      await loadAdmins()
    } catch (err) {
      setError(err.message || 'Could not update admin.')
    }
    setSubmitting(false)
  }

  const handleRemove = async (email) => {
    if (!window.confirm(`Remove admin access for ${email}?`)) return
    setError('')
    setMessage('')
    try {
      await removeAdminAccount(email, user)
      setMessage('Admin account removed.')
      await loadAdmins()
    } catch (err) {
      setError(err.message || 'Could not remove admin.')
    }
  }

  const assignablePerms = ALL_PERMISSIONS.filter((p) => p !== 'settings' && p !== 'admins')

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Admin accounts</h1>
          <p>
            Create admins and assign what they can control on the website — products, services,
            enquiries, and staff.
          </p>
        </div>
      </div>

      {message && <div className="admin-alert admin-alert--ok" role="status">{message}</div>}
      {error && <div className="admin-alert admin-alert--err" role="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Add admin</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="admin-name">Full name *</label>
              <input
                id="admin-name"
                className="field"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-email">Email *</label>
              <input
                id="admin-email"
                className="field"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-phone">Phone</label>
              <input
                id="admin-phone"
                className="field"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-pw">Temporary password *</label>
              <input
                id="admin-pw"
                className="field"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
              <legend style={{ fontSize: '0.88rem', marginBottom: 8 }}>Permissions</legend>
              {assignablePerms.map((perm) => (
                <label key={perm} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm)}
                    onChange={() => togglePerm(form.permissions, perm, (next) => setForm((p) => ({ ...p, permissions: next })))}
                  />
                  {PERMISSION_LABELS[perm]}
                </label>
              ))}
            </fieldset>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create admin account'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--dim)' }}>
            <h2 style={{ fontSize: '1.05rem' }}>Active admins ({admins.length})</h2>
          </div>
          {loading ? (
            <p style={{ padding: '1.5rem', color: 'var(--muted)' }}>Loading…</p>
          ) : admins.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--muted)' }}>No admin accounts yet besides super admin.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Permissions</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.email}>
                    <td><strong>{a.name}</strong></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{a.email}</td>
                    <td>
                      {editing === a.email ? (
                        <div style={{ minWidth: 180 }}>
                          {assignablePerms.map((perm) => (
                            <label key={perm} style={{ display: 'flex', gap: 6, fontSize: '0.78rem', marginBottom: 4 }}>
                              <input
                                type="checkbox"
                                checked={editPerms.includes(perm)}
                                onChange={() => togglePerm(editPerms, perm, setEditPerms)}
                              />
                              {PERMISSION_LABELS[perm]}
                            </label>
                          ))}
                          <input
                            type="password"
                            className="field"
                            placeholder="New password (optional)"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            style={{ marginTop: 8, fontSize: '0.82rem' }}
                          />
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            <button type="button" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => handleUpdatePerms(a.email)} disabled={submitting}>
                              Save
                            </button>
                            <button type="button" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setEditing(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem' }}>
                          {(a.permissions || []).map((p) => PERMISSION_LABELS[p]?.split(' ')[0] || p).join(', ')}
                        </span>
                      )}
                    </td>
                    <td>
                      {editing !== a.email && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => {
                              setEditing(a.email)
                              setEditPerms(a.permissions || [...DEFAULT_ADMIN_PERMISSIONS])
                              setEditPassword('')
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--err)' }}
                            onClick={() => handleRemove(a.email)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--muted)' }}>
        Super admin ({getRoleLabel('superadmin')}) always has full access including settings.
        Admins only see tabs you grant them.
      </p>
    </div>
  )
}
