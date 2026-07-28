import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import PageHero from '../components/PageHero'
import OptimizedImage from '../components/OptimizedImage'
import { useApp } from '../context/AppContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { SITE } from '../data/site'
import { db, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'
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
  { id: 1, label: 'Add items' },
  { id: 2, label: 'Submit request' },
]

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  location: '',
  budget: '',
  budgetTier: '',
  notes: '',
  preferredContact: 'whatsapp',
  requestType: 'formal_quote',
}

export default function QuotePage() {
  const location = useLocation()
  const meta = usePageMeta('quote')
  const {
    quoteCart,
    quoteCount,
    quoteEstimate,
    updateQuoteQty,
    removeFromQuote,
    clearQuote,
    firebaseReady,
    user,
    siteContent,
  } = useApp()

  const budgetTiers = siteContent?.budgetTiers || []
  const budgetNote = siteContent?.budgetNote || ''

  const hasServiceItems = useMemo(
    () => quoteCart.some((item) => item.itemType === 'service'),
    [quoteCart],
  )
  const hasProductItems = useMemo(
    () => quoteCart.some((item) => item.itemType !== 'service'),
    [quoteCart],
  )

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
    if (hasServiceItems && !hasProductItems) {
      setForm((prev) => (prev.requestType === 'formal_quote' ? { ...prev, requestType: 'service_request' } : prev))
    }
  }, [hasServiceItems, hasProductItems])

  useEffect(() => {
    if (location.state?.requestType) {
      setForm((prev) => ({ ...prev, requestType: location.state.requestType }))
    }
  }, [location.state?.requestType])

  const displayStep = quoteCart.length === 0 ? 1 : 2

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!quoteCart.length) {
      setError('Add at least one product from the shop or a service from our Services page.')
      return
    }
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.')
      return
    }
    if (form.requestType === 'budget_request' && !form.budget.trim() && !form.budgetTier) {
      setError('Please select a budget tier or enter your budget range.')
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
      budgetTier: form.budgetTier || null,
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
        const ref = await addDoc(collection(db, FS.QUOTE_REQUESTS), {
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
    } catch (err) {
      setError(err.message || 'Could not submit your request. Please try WhatsApp instead.')
    }

    setSubmitting(false)
  }

  if (submitted) {
    return (
      <>
        <PageHero
          eyebrow={meta.eyebrow}
          title="Request Submitted"
          subtitle="Thank you — our workshop team will review your selections and respond shortly."
          image={meta.heroImage}
          position={meta.heroPosition}
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
        eyebrow={meta.eyebrow}
        title={meta.heading}
        subtitle={meta.sub}
        image={meta.heroImage}
        position={meta.heroPosition}
      />

      <section className="section quote">
        <div className="container">
          <div className="quote__steps" aria-label="Quote progress">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`quote-step ${displayStep >= s.id ? 'quote-step--active' : ''} ${displayStep === s.id ? 'quote-step--current' : ''}`}
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
                  <p>Add products from the shop or request a service — repairs, builds, consultation, and more.</p>
                  <div className="quote__empty-actions">
                    <Link to="/services" className="btn btn-primary">Browse services</Link>
                    <Link to="/shop" className="btn btn-outline">Browse shop</Link>
                  </div>
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
                            <span className="quote__item-cat">
                              {item.itemType === 'service' ? 'Service' : item.category}
                            </span>
                            <strong>{item.title}</strong>
                            {item.serviceDescription && (
                              <span className="quote__item-desc">{item.serviceDescription}</span>
                            )}
                            <span className="quote__item-price">
                              {item.quoteOnly ? 'Price on request' : formatKes(item.unitPrice)}
                            </span>
                          </div>
                          <div className="quote__item-qty">
                            {item.itemType === 'service' ? (
                              <span className="quote__item-service-qty" aria-label="Quantity">1</span>
                            ) : (
                              <>
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
                              </>
                            )}
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

                    <div className={`quote__type ${hasServiceItems ? 'quote__type--three' : ''}`}>
                      {hasServiceItems && (
                        <label className={`quote__type-option ${form.requestType === 'service_request' ? 'quote__type-option--active' : ''}`}>
                          <input
                            type="radio"
                            name="requestType"
                            value="service_request"
                            checked={form.requestType === 'service_request'}
                            onChange={() => setField('requestType', 'service_request')}
                          />
                          <span>
                            <strong>Service request</strong>
                            <small>Workshop service — build, repair, or consultation</small>
                          </span>
                        </label>
                      )}
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
                          <small>Options within your price range — all incomes welcome</small>
                        </span>
                      </label>
                    </div>

                    {form.requestType === 'budget_request' && (
                      <div className="quote__budget-section">
                        <p className="quote__budget-intro">{budgetNote}</p>
                        <div className="quote__budget-tiers">
                          {budgetTiers.map((tier) => (
                            <label
                              key={tier.id}
                              className={`quote__budget-tier ${form.budgetTier === tier.id ? 'quote__budget-tier--active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="budgetTier"
                                value={tier.id}
                                checked={form.budgetTier === tier.id}
                                onChange={() => {
                                  setField('budgetTier', tier.id)
                                  if (tier.range && tier.id !== 'flexible') {
                                    setField('budget', tier.range)
                                  }
                                }}
                              />
                              <span>
                                <strong>{tier.label}</strong>
                                <small>{tier.range}</small>
                                {tier.note && <em>{tier.note}</em>}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

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
                        <label htmlFor="quote-budget">
                          {form.requestType === 'budget_request' ? 'Your budget (required if no tier selected) *' : 'Budget range (optional)'}
                        </label>
                        <input
                          id="quote-budget"
                          className="field"
                          value={form.budget}
                          onChange={(e) => setField('budget', e.target.value)}
                          placeholder="e.g. KSh 80,000 or pay in 3 instalments"
                          required={form.requestType === 'budget_request' && !form.budgetTier}
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
                      {submitting ? 'Submitting…' : form.requestType === 'service_request' ? 'Submit service request' : 'Submit quote request'}
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
                  <li>✦ Flexible budgets for every client</li>
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
