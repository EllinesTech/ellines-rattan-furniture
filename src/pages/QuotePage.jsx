import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import PageHero from '../components/PageHero'
import OptimizedImage from '../components/OptimizedImage'
import { useApp } from '../context/AppContext'
import { SITE } from '../data/site'
import { db, isFirebaseConfigured } from '../firebase'
import {
  buildQuoteMailto,
  buildQuoteWhatsAppMessage,
  buildWhatsAppLink,
  formatKes,
  loadAdminSettings,
  saveLocalQuoteRequest,
} from '../utils/auth'
import './QuotePage.css'

const STEPS = [
  { id: 1, label: 'Review items' },
  { id: 2, label: 'Your details' },
  { id: 3, label: 'Send request' },
]

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  location: '',
  budget: '',
  notes: '',
  preferredContact: 'whatsapp',
  requestType: 'formal_quote',
}

export default function QuotePage() {
  const {
    quoteCart,
    quoteCount,
    quoteEstimate,
    updateQuoteQty,
    removeFromQuote,
    clearQuote,
    firebaseReady,
    user,
  } = useApp()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState('')
  const [notificationEmail, setNotificationEmail] = useState(SITE.email)

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }))
    }
  }, [user])

  useEffect(() => {
    loadAdminSettings().then((s) => {
      if (s?.notificationEmail) setNotificationEmail(s.notificationEmail)
    })
  }, [])

  useEffect(() => {
    if (quoteCart.length === 0) setStep(1)
    else if (step === 1 && quoteCart.length > 0) setStep(2)
  }, [quoteCart.length, step])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!quoteCart.length) {
      setError('Add at least one product from the shop.')
      return
    }
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }

    setSubmitting(true)

    const payload = {
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
      },
      budget: form.budget.trim(),
      notes: form.notes.trim(),
      preferredContact: form.preferredContact,
      requestType: form.requestType,
      items: quoteCart,
      estimatedTotal: quoteEstimate,
      status: 'new',
      read: false,
      userId: user?.id || null,
      clientEmail: (form.email.trim() || user?.email || '').toLowerCase() || null,
      assignedTo: null,
    }

    try {
      let saved = null
      if (firebaseReady && db) {
        const ref = await addDoc(collection(db, 'quote_requests'), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        saved = { id: ref.id, ...payload, createdAt: new Date().toISOString() }
      } else {
        saved = saveLocalQuoteRequest(payload)
      }

      const waLink = buildWhatsAppLink({
        phone: SITE.whatsapp.number,
        message: buildQuoteWhatsAppMessage(saved),
      })
      const mailLink = buildQuoteMailto(saved, notificationEmail)

      setSubmitted({ ...saved, waLink, mailLink })
      clearQuote()
      setForm(EMPTY_FORM)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Could not submit your request. Please try WhatsApp instead.')
    }

    setSubmitting(false)
  }

  if (submitted) {
    return (
      <>
        <PageHero
          eyebrow="Quote"
          title="Request Submitted"
          subtitle="Thank you — our workshop team will review your selections and respond shortly."
          image="/images/projects/project-original-living-set-brown.jpg"
          position="center 40%"
        />
        <section className="section">
          <div className="container">
            <div className="quote-success card">
              <div className="quote-success__icon" aria-hidden>✓</div>
              <h2>Your quote request is on its way</h2>
              {!firebaseReady && (
                <p className="quote-success__note">
                  Saved locally in this browser. Connect Firebase to sync enquiries across devices.
                </p>
              )}
              <div className="quote-success__ref">
                <span>Reference</span>
                <strong>{submitted.id}</strong>
                {submitted.estimatedTotal > 0 && (
                  <span className="quote-success__estimate">
                    Est. {formatKes(submitted.estimatedTotal)}
                  </span>
                )}
              </div>
              <ul className="quote-success__steps">
                <li>We review your selections within one business day</li>
                <li>Our team contacts you via your preferred method</li>
                <li>Final pricing depends on size, weave, and finish</li>
              </ul>
              <div className="quote-success__actions">
                <a href={submitted.waLink} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
                  Continue on WhatsApp
                </a>
                <a href={submitted.mailLink} className="btn btn-outline">
                  Send via Email
                </a>
                {user ? (
                  <Link to="/account" className="btn btn-primary">View my quotes</Link>
                ) : (
                  <Link to="/account/login" className="btn btn-primary">Create account to track</Link>
                )}
                <Link to="/shop" className="btn btn-outline">Back to shop</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Quote Builder"
        title="Build Your Quote"
        subtitle="Review your selections, share your details, and request a workshop estimate."
        image="/images/projects/project-original-armchair-shaggy.jpg"
        position="center 30%"
      />

      <section className="section quote">
        <div className="container">
          <div className="quote__steps" aria-label="Quote progress">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`quote-step ${step >= s.id ? 'quote-step--active' : ''} ${step === s.id ? 'quote-step--current' : ''}`}
              >
                <span className="quote-step__num">{s.id}</span>
                <span className="quote-step__label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="quote__layout">
            <div className="quote__main">
              {quoteCart.length === 0 ? (
                <div className="quote__empty card">
                  <div className="quote__empty-icon" aria-hidden>🛋️</div>
                  <h2>Your quote list is empty</h2>
                  <p>Browse our workshop catalogue and add pieces you&apos;d like estimated.</p>
                  <Link to="/shop" className="btn btn-primary">Browse shop</Link>
                </div>
              ) : (
                <>
                  <div className="quote__list card">
                    <div className="quote__list-head">
                      <h2>Your selections</h2>
                      <button type="button" className="quote__clear" onClick={clearQuote}>
                        Clear all
                      </button>
                    </div>
                    <ul className="quote__items">
                      {quoteCart.map((item) => (
                        <li key={item.productId} className="quote__item">
                          <div className="quote__item-media">
                            {item.src ? (
                              <OptimizedImage src={item.src} alt="" loading="lazy" />
                            ) : (
                              <div className="quote__item-placeholder" />
                            )}
                          </div>
                          <div className="quote__item-info">
                            <span className="quote__item-cat">{item.category}</span>
                            <strong>{item.title}</strong>
                            <span className="quote__item-price">
                              {item.quoteOnly ? 'Price on request' : formatKes(item.unitPrice)}
                            </span>
                          </div>
                          <div className="quote__item-qty">
                            <button
                              type="button"
                              onClick={() => updateQuoteQty(item.productId, item.qty - 1)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span>{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuoteQty(item.productId, item.qty + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="quote__item-remove"
                            onClick={() => removeFromQuote(item.productId)}
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <form className="quote__form card" onSubmit={handleSubmit} id="quote-form">
                    <h2>Your details</h2>
                    <p className="quote__form-intro">
                      We&apos;ll use these details to prepare your workshop estimate.
                      {user ? ` Signed in as ${user.name}.` : ''}
                    </p>

                    {error && (
                      <div className="quote__error" role="alert">{error}</div>
                    )}

                    <div className="quote__type">
                      <label className={`quote__type-option ${form.requestType === 'formal_quote' ? 'quote__type-option--active' : ''}`}>
                        <input
                          type="radio"
                          name="requestType"
                          value="formal_quote"
                          checked={form.requestType === 'formal_quote'}
                          onChange={() => setField('requestType', 'formal_quote')}
                        />
                        <span>
                          <strong>Formal quote</strong>
                          <small>Detailed estimate for your selections</small>
                        </span>
                      </label>
                      <label className={`quote__type-option ${form.requestType === 'budget_request' ? 'quote__type-option--active' : ''}`}>
                        <input
                          type="radio"
                          name="requestType"
                          value="budget_request"
                          checked={form.requestType === 'budget_request'}
                          onChange={() => setField('requestType', 'budget_request')}
                        />
                        <span>
                          <strong>Budget request</strong>
                          <small>Options within your price range</small>
                        </span>
                      </label>
                    </div>

                    <div className="quote__fields">
                      <div className="form-group">
                        <label htmlFor="quote-name">Full name *</label>
                        <input
                          id="quote-name"
                          className="field"
                          value={form.name}
                          onChange={(e) => setField('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="quote-phone">Phone / WhatsApp *</label>
                        <input
                          id="quote-phone"
                          className="field"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setField('phone', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="quote-email">Email</label>
                        <input
                          id="quote-email"
                          className="field"
                          type="email"
                          value={form.email}
                          onChange={(e) => setField('email', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="quote-location">Delivery location</label>
                        <input
                          id="quote-location"
                          className="field"
                          value={form.location}
                          onChange={(e) => setField('location', e.target.value)}
                          placeholder="e.g. Nairobi, Westlands"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="quote-budget">Budget range (optional)</label>
                        <input
                          id="quote-budget"
                          className="field"
                          value={form.budget}
                          onChange={(e) => setField('budget', e.target.value)}
                          placeholder="e.g. KSh 150,000 – 200,000"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="quote-contact">Preferred contact</label>
                        <select
                          id="quote-contact"
                          className="field"
                          value={form.preferredContact}
                          onChange={(e) => setField('preferredContact', e.target.value)}
                        >
                          <option value="whatsapp">WhatsApp</option>
                          <option value="phone">Phone call</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="quote-notes">Notes</label>
                      <textarea
                        id="quote-notes"
                        className="field"
                        rows={4}
                        value={form.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                        placeholder="Dimensions, colours, timeline, or reference photos…"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary quote__submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting…' : 'Submit quote request'}
                    </button>
                  </form>
                </>
              )}
            </div>

            <aside className="quote__sidebar">
              <div className="quote-summary card">
                <h3>Quote summary</h3>
                <div className="quote-summary__count">
                  {quoteCount} {quoteCount === 1 ? 'item' : 'items'}
                </div>
                <div className="quote-summary__total">
                  <span>Estimated starting total</span>
                  <strong>{quoteEstimate > 0 ? formatKes(quoteEstimate) : 'Custom quote'}</strong>
                </div>
                <p className="quote-summary__note">
                  Final pricing depends on size, weave pattern, and finish. Delivery quoted separately.
                </p>
                <ul className="quote-summary__trust">
                  <li>✦ Workshop-direct pricing</li>
                  <li>✦ Hand-woven in Kenya</li>
                  <li>✦ Response within 1 business day</li>
                </ul>
                {quoteCart.length > 0 && (
                  <a href="#quote-form" className="btn btn-primary quote-summary__cta">
                    Continue to details
                  </a>
                )}
                <a
                  href={buildWhatsAppLink({ phone: SITE.whatsapp.number, message: SITE.whatsapp.message })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa"
                  style={{ marginTop: 8 }}
                >
                  Or chat on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
