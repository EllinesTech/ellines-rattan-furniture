import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductsPanel from './admin-panels/ProductsPanel'
import EnquiriesPanel from './admin-panels/EnquiriesPanel'
import StaffPanel from './admin-panels/StaffPanel'
import SettingsPanel from './admin-panels/SettingsPanel'
import { getRoleLabel } from '../utils/roles'
import './Admin.css'

const BASE_TABS = [
  { id: 'enquiries', label: 'Enquiries', icon: '📋' },
  { id: 'products', label: 'Products', icon: '🛋️' },
  { id: 'staff', label: 'Staff', icon: '👥' },
]

export default function Admin() {
  const { user, setUser, unreadEnquiries, firebaseReady, productsSource, isSuperAdmin } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('enquiries')

  const tabs = isSuperAdmin
    ? [...BASE_TABS, { id: 'settings', label: 'Settings', icon: '⚙️' }]
    : BASE_TABS

  const signOut = () => {
    setUser(null)
    navigate('/admin/login', { replace: true })
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
          {user?.role === 'staff' && (
            <Link to="/staff" className="admin-sidebar__site-link">Staff dashboard</Link>
          )}
          <Link to="/" className="admin-sidebar__site-link">View site</Link>
          <button type="button" className="admin-sidebar__signout" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'products' && <ProductsPanel />}
        {tab === 'enquiries' && <EnquiriesPanel />}
        {tab === 'staff' && <StaffPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  )
}
