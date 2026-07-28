import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { registerClient, loginPortalUser } from '../utils/auth'
import { getPostLoginRoute } from '../utils/roles'
import { isFirebaseConfigured } from '../firebase'
import './AccountLogin.css'

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

export default function AccountLogin() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const firebaseReady = isFirebaseConfigured()
  const from = location.state?.from?.pathname || '/account'

  useEffect(() => {
    if (user) {
      navigate(getPostLoginRoute(user) === '/account' ? from : getPostLoginRoute(user), { replace: true })
    }
  }, [user, navigate, from])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'register') {
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
          throw new Error('Please fill in all required fields.')
        }
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }
        const account = await registerClient(form)
        setUser(account)
        navigate(from, { replace: true })
      } else {
        const account = await loginPortalUser(form.email, form.password)
        if (!account) {
          throw new Error('Invalid email or password.')
        }
        if (account.role !== 'client') {
          throw new Error('Please use the team sign-in page for staff and admin accounts.')
        }
        setUser(account)
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }

    setSubmitting(false)
  }

  return (
    <main className="account-login">
      <div className="account-login__wrap">
        <div className="account-login__card card">
          <div className="account-login__top">
            <Link to="/" className="account-login__brand">
              <img src="/images/logos/ellines-rattan-logo-transparent.png" alt="" width="48" height="48" />
              <span>Ellines Rattan</span>
            </Link>
            <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p>
              {mode === 'login'
                ? 'Sign in to track quote requests and manage your enquiries.'
                : 'Register for furniture enquiry accounts — no checkout required.'}
            </p>
          </div>

          {!firebaseReady && (
            <div className="account-login__banner" role="status">
              Firebase not configured — accounts are stored locally in this browser for development.
            </div>
          )}

          <div className="account-login__tabs">
            <button
              type="button"
              className={mode === 'login' ? 'account-login__tab--active' : ''}
              onClick={() => { setMode('login'); setError('') }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'account-login__tab--active' : ''}
              onClick={() => { setMode('register'); setError('') }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="account-login__form">
            {error && (
              <div className="account-login__error" role="alert">{error}</div>
            )}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="acct-name">Full name *</label>
                  <input
                    id="acct-name"
                    className="field"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="acct-phone">Phone / WhatsApp *</label>
                  <input
                    id="acct-phone"
                    className="field"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="acct-email">Email *</label>
              <input
                id="acct-email"
                className="field"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="acct-password">Password *</label>
              <div className="account-login__pw">
                <input
                  id="acct-password"
                  className="field"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                />
                <button
                  type="button"
                  className="account-login__pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary account-login__submit" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="account-login__team">
            Workshop team? <Link to="/admin/login">Team sign in →</Link>
          </p>

          <p className="account-login__back">
            <Link to="/">← Back to website</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
