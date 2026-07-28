import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  loadAdminSettings,
  saveAdminSettings,
  updateSuperAdminEmail,
} from '../../utils/auth'

export default function SettingsPanel() {
  const { user, setUser, isSuperAdmin, adminSettings, setAdminSettings } = useApp()
  const [form, setForm] = useState({
    superAdminEmail: '',
    notificationEmail: '',
    currentPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAdminSettings().then((settings) => {
      setForm((prev) => ({
        ...prev,
        superAdminEmail: settings.superAdminEmail || '',
        notificationEmail: settings.notificationEmail || 'info@ellines.co.ke',
      }))
      setLoading(false)
    })
  }, [adminSettings])

  if (!isSuperAdmin) {
    return (
      <div>
        <div className="admin-panel__head">
          <h1>Settings</h1>
          <p>Only the super admin can change these settings.</p>
        </div>
      </div>
    )
  }

  const handleSaveNotification = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await saveAdminSettings(
        {
          superAdminEmail: form.superAdminEmail,
          notificationEmail: form.notificationEmail,
        },
        user.email,
      )
      setAdminSettings({
        superAdminEmail: form.superAdminEmail.toLowerCase(),
        notificationEmail: form.notificationEmail.toLowerCase(),
      })
      setMessage('Notification settings saved.')
    } catch (err) {
      setError(err.message || 'Could not save settings.')
    }
    setSaving(false)
  }

  const handleChangeSuperEmail = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!form.currentPassword) {
      setError('Enter your current password to change the super admin email.')
      return
    }
    setSaving(true)
    try {
      const newEmail = await updateSuperAdminEmail(
        form.superAdminEmail,
        form.currentPassword,
        user,
      )
      setUser({ ...user, email: newEmail })
      setAdminSettings((prev) => ({ ...prev, superAdminEmail: newEmail }))
      setForm((prev) => ({ ...prev, currentPassword: '' }))
      setMessage('Super admin email updated successfully.')
    } catch (err) {
      setError(err.message || 'Could not update super admin email.')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="admin-panel__head">
        <div>
          <h1>Super Admin Settings</h1>
          <p>Manage platform email configuration and notifications.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading settings…</p>
      ) : (
        <>
          {message && (
            <div className="admin-alert admin-alert--ok" role="status">{message}</div>
          )}
          {error && (
            <div className="admin-alert admin-alert--err" role="alert">{error}</div>
          )}

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Super admin email</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              This is the primary super admin account. Changing it requires your current password.
            </p>
            <form onSubmit={handleChangeSuperEmail}>
              <div className="form-group">
                <label htmlFor="super-email">Super admin email</label>
                <input
                  id="super-email"
                  className="field"
                  type="email"
                  value={form.superAdminEmail}
                  onChange={(e) => setForm((p) => ({ ...p, superAdminEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="super-pw">Current password (required to change email)</label>
                <input
                  id="super-pw"
                  className="field"
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                Update super admin email
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Notifications</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              Email address for quote enquiry notifications and system alerts.
            </p>
            <form onSubmit={handleSaveNotification}>
              <div className="form-group">
                <label htmlFor="notif-email">Notification email</label>
                <input
                  id="notif-email"
                  className="field"
                  type="email"
                  value={form.notificationEmail}
                  onChange={(e) => setForm((p) => ({ ...p, notificationEmail: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-outline" disabled={saving}>
                Save notification email
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
