import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { createStaffAccount, listStaffOnly } from '../../utils/auth'
import { getRoleLabel } from '../../utils/roles'

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' }

export default function StaffPanel() {
  const { user, isSuperAdmin } = useApp()
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadStaff = async () => {
    setLoading(true)
    const list = await listStaffOnly()
    setStaff(list)
    setLoading(false)
  }

  useEffect(() => {
    loadStaff()
  }, [])

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
      await createStaffAccount(form, user)
      setForm(EMPTY_FORM)
      setMessage('Staff account created. They can sign in at the team login page.')
      await loadStaff()
    } catch (err) {
      setError(err.message || 'Could not create staff account.')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Staff accounts</h1>
          <p>
            Create workshop staff who can manage quote enquiries from the staff dashboard.
            {!isSuperAdmin && ' Only super admins can manage super admin settings.'}
          </p>
        </div>
      </div>

      {message && <div className="admin-alert admin-alert--ok" role="status">{message}</div>}
      {error && <div className="admin-alert admin-alert--err" role="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Add staff member</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="staff-name">Full name *</label>
              <input
                id="staff-name"
                className="field"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="staff-email">Email *</label>
              <input
                id="staff-email"
                className="field"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="staff-phone">Phone</label>
              <input
                id="staff-phone"
                className="field"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="staff-pw">Temporary password *</label>
              <input
                id="staff-pw"
                className="field"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create staff account'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--dim)' }}>
            <h2 style={{ fontSize: '1.05rem' }}>Active staff ({staff.length})</h2>
          </div>
          {loading ? (
            <p style={{ padding: '1.5rem', color: 'var(--muted)' }}>Loading…</p>
          ) : staff.length === 0 ? (
            <p style={{ padding: '1.5rem', color: 'var(--muted)' }}>No staff accounts yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{s.email}</td>
                    <td>
                      <span className="badge badge-gold">{getRoleLabel(s.role)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
