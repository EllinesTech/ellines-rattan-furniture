import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './CookieConsent.css'

const STORAGE_KEY = 'ellines-cookie-consent'
export const COOKIE_SETTINGS_EVENT = 'ellines:open-cookie-settings'

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.choice === 'all' || parsed?.choice === 'essential') return parsed
  } catch {
    /* ignore corrupt storage */
  }
  return null
}

function saveConsent(choice) {
  const payload = { choice, at: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  return payload
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = readConsent()
    if (!existing) setVisible(true)

    const openSettings = () => setVisible(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('has-cookie-banner', visible)
    return () => document.documentElement.classList.remove('has-cookie-banner')
  }, [visible])

  const choose = (choice) => {
    saveConsent(choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent__inner">
        <div className="cookie-consent__copy">
          <h2 id="cookie-consent-title" className="cookie-consent__title">
            Cookies &amp; your data
          </h2>
          <p>
            We use essential cookies so quotes and preferences work. Optional analytics help us improve the site —
            only if you accept. Read our{' '}
            <Link to="/cookies">Cookie Policy</Link>,{' '}
            <Link to="/privacy">Privacy Policy</Link>, and{' '}
            <Link to="/terms">Terms of Use</Link>.
          </p>
        </div>
        <div className="cookie-consent__actions">
          <button type="button" className="btn btn-outline cookie-consent__btn" onClick={() => choose('essential')}>
            Essential only
          </button>
          <button type="button" className="btn btn-primary cookie-consent__btn" onClick={() => choose('all')}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
}
