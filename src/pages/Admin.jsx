import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductsPanel from './admin-panels/ProductsPanel'
import EnquiriesPanel from './admin-panels/EnquiriesPanel'
import StaffPanel from './admin-panels/StaffPanel'
import SettingsPanel from './admin-panels/SettingsPanel'
import AdminsPanel from './admin-panels/AdminsPanel'
import ServicesPanel from './admin-panels/ServicesPanel'
import GodModePanel from './admin-panels/GodModePanel'
import { PERMISSIONS } from '../utils/permissions'
import { getRoleLabel } from '../utils/roles'
import './Admin.css'

const TAB_DEFS = [
  { id: 'enquiries', label: 'Enquiries', icon: '📋', permission: PERMISSIONS.ENQUIRIES },
  { id: 'products', label: 'Products', icon: '🛋️', permission: PERMISSIONS.PRODUCTS },
  { id: 'services', label: 'Services', icon: '🔧', permission: PERMISSIONS.SERVICES },
  { id: 'staff', label: 'Staff', icon: '👥', permission: PERMISSIONS.STAFF },
  { id: 'admins', label: 'Admins', icon: '🛡️', permission: PERMISSIONS.ADMINS, superOnly: true },
  { id: 'control', label: 'Control', icon: '🎛️', permission: PERMISSIONS.CONTROL, superOnly: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', permission: PERMISSIONS.SETTINGS, superOnly: true },
]

export default function Admin() {
  const { user, setUser, unreadEnquiries, firebaseReady, productsSource, isSuperAdmin, hasPermission } = useApp()
  const navigate = useNavigate()

  const tabs = useMemo(
    () =>
      TAB_DEFS.filter((t) => {
        if (t.superOnly && !isSuperAdmin) return false
        return hasPermission(t.permission)
      }),
    [isSuperAdmin, hasPermission, user?.permissions],
  )

  const [tab, setTab] = useState('enquiries')

  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.id === tab)) {
      setTab(tabs[0].id)
    }
  }, [tabs, tab])

  const signOut = () => {
    setUser(null)
    navigate('/admin/login', { replace: true })
  }

  if (tabs.length === 0) {
    return (
      <div className="admin-shell">
        <main className="admin-main" style={{ padding: '2rem' }}>
          <h1>No access</h1>
          <p>Your admin account has no permissions assigned. Contact the super admin.</p>
          <button type="button" className="btn btn-outline" onClick={signOut}>Sign out</button>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src="/images/logos/ellines-rattan-logo-transparent.png" alt="" width="36" height="36" />
          <div>
            <strong>Ellines Admin</strong>
            <span>{user?.name}</span>
            <span className="admin-sidebar__role">{getRoleLabel(user?.role)}</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-sidebar__link ${tab === item.id ? 'admin-sidebar__link--active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === 'enquiries' && unreadEnquiries > 0 && (
                <span className="admin-sidebar__badge">{unreadEnquiries}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__status">
            <span className={`admin-sidebar__dot ${firebaseReady ? 'admin-sidebar__dot--on' : ''}`} />
            {firebaseReady ? `Live · ${productsSource}` : 'Offline / seed mode'}
          </div>
          {(user?.role === 'staff' || hasPermission(PERMISSIONS.ENQUIRIES)) && (
            <Link to="/staff" className="admin-sidebar__site-link">Staff dashboard</Link>
          )}
          <Link to="/" className="admin-sidebar__site-link">View site</Link>
          <button type="button" className="admin-sidebar__signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <nav className="admin-mobile-tabs" aria-label="Admin sections">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-mobile-tabs__btn ${tab === item.id ? 'admin-mobile-tabs__btn--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
            {item.id === 'enquiries' && unreadEnquiries > 0 && (
              <span className="admin-sidebar__badge">{unreadEnquiries}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {tab === 'products' && <ProductsPanel />}
        {tab === 'services' && <ServicesPanel />}
        {tab === 'enquiries' && <EnquiriesPanel />}
        {tab === 'staff' && <StaffPanel />}
        {tab === 'admins' && <AdminsPanel />}
        {tab === 'control' && <GodModePanel />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  )
}
