import { useState } from 'react'
import { subscribeNewsletter } from '../utils/subscriptions'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    setLoading(true)
    try {
      await subscribeNewsletter(email)
      setStatus('Subscribed — thank you!')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Could not subscribe.')
    }
    setLoading(false)
  }

  return (
    <form className="footer__newsletter" onSubmit={handleSubmit}>
      <h3>Workshop updates</h3>
      <p>Offers, new collections, and care tips — no spam.</p>
      <div className="footer__newsletter-row">
        <input
          type="email"
          className="field"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email for newsletter"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '…' : 'Subscribe'}
        </button>
      </div>
      {status && <p className="footer__newsletter-ok">{status}</p>}
      {error && <p className="footer__newsletter-err" role="alert">{error}</p>}
    </form>
  )
}
