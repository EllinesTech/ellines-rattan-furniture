import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { authenticateUser, isDevAdminMode } from '../utils/auth'
import { getPostLoginRoute } from '../utils/roles'
import { isFirebaseConfigured, SUPER_ADMIN_EMAIL } from '../firebase'
import './AdminLogin.css'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function AdminLogin() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(SUPER_ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const firebaseReady = isFirebaseConfigured()
  const devMode = isDevAdminMode()

  useEffect(() => {
    if (user) {
      const target = location.state?.from?.pathname || getPostLoginRoute(user)
      navigate(target, { replace: true })
    }
  }, [user, navigate, location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const account = await authenticateUser(email.trim(), password)
      if (!account) {
        setError('Invalid email or password.')
        setSubmitting(false)
        return
      }
      if (account.role === 'client') {
        setError('Client accounts should sign in at the account page.')
        setSubmitting(false)
        return
      }
      setUser({
        id: account.id || 'admin01',
        name: account.name || 'Admin',
        email: account.email,
        phone: account.phone,
        role: account.role || 'admin',
      })
      const target = location.state?.from?.pathname || getPostLoginRoute(account)
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <main className="admin-login">
      <div className="admin-login__wrap">
        <div className="admin-login__card card">
          <div className="admin-login__top">
            <Link to="/" className="admin-login__brand">
              <img src="/images/logos/ellines-rattan-logo-transparent.png" alt="" width="48" height="48" />
              <span>Ellines Rattan</span>
            </Link>
            <h1>Team Sign In</h1>
            <p>Admin, super admin, and workshop staff access.</p>
          </div>

          {!firebaseReady && !devMode && (
            <div className="admin-login__banner admin-login__banner--warn" role="status">
              Firebase is not configured. Add <code>VITE_FIREBASE_*</code> variables from{' '}
              <code>.env.example</code>, or set <code>VITE_DEV_ADMIN_PASSWORD</code> for local-only access.
            </div>
          )}

          {devMode && !firebaseReady && (
            <div className="admin-login__banner admin-login__banner--info" role="status">
              Running in local dev mode — credentials are stored in this browser only.
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login__form">
            {error && (
              <div className="admin-login__error" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-login__pw">
                <input
                  id="admin-password"
                  className="field"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={!firebaseReady && !devMode}
                />
                <button
                  type="button"
                  className="admin-login__pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary admin-login__submit"
              disabled={submitting || (!firebaseReady && !devMode)}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="admin-login__back">
            Customer? <Link to="/account/login">Account sign in →</Link>
          </p>
          <p className="admin-login__back">
            <Link to="/">← Back to website</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
