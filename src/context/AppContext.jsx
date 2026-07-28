import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'
import { SEED_PRODUCTS } from '../data/seedProducts'
import { PAGE_META } from '../data/pages'
import {
  SERVICES,
  SERVICE_PRICING,
  BUDGET_TIERS,
  BUDGET_NOTE,
} from '../data/site'
import { loadLocalQuoteRequests, loadAdminSettings } from '../utils/auth'
import {
  isSuperAdmin,
  isAdminRole,
  isStaffRole,
  isClientRole,
  canAccessAdmin,
  canAccessStaff,
} from '../utils/roles'
import { hasPermission, getUserPermissions, DEFAULT_ADMIN_PERMISSIONS } from '../utils/permissions'

const Ctx = createContext(null)

const USER_KEY = 'er_user'
const CART_KEY = 'er_quote_cart'

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw || raw === 'undefined' || raw === 'null') return fallback
    return JSON.parse(raw) ?? fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  if (value === undefined) return
  localStorage.setItem(key, JSON.stringify(value))
}

const PRODUCTS_DOC = () => (db ? doc(db, FS.SITE_DATA, FS.PRODUCTS_CATALOGUE) : null)
const SITE_CONTENT_DOC = () => (db ? doc(db, FS.SITE_DATA, FS.SITE_CONTENT) : null)
const SITE_PAGES_DOC = () => (db ? doc(db, FS.SITE_DATA, FS.SITE_PAGES) : null)

const DEFAULT_SITE_CONTENT = {
  services: SERVICES,
  servicePricing: SERVICE_PRICING,
  budgetTiers: BUDGET_TIERS,
  budgetNote: BUDGET_NOTE,
}

function normalizeProduct(raw, index = 0) {
  return {
    id: raw.id || `product_${index}`,
    title: raw.title || 'Untitled',
    category: raw.category || 'Other',
    src: raw.src || '',
    description: raw.description || '',
    startingPrice: raw.quoteOnly ? null : (raw.startingPrice ?? null),
    quoteOnly: Boolean(raw.quoteOnly),
    active: raw.active !== false,
    featured: Boolean(raw.featured),
    sortOrder: raw.sortOrder ?? index,
  }
}

export function AppProvider({ children }) {
  const [user, setUserState] = useState(() => {
    const loaded = loadJson(USER_KEY, null)
    if (loaded?.role === 'admin' && !loaded.permissions?.length) {
      return { ...loaded, permissions: DEFAULT_ADMIN_PERMISSIONS }
    }
    return loaded
  })
  const [quoteCart, setQuoteCartState] = useState(() => loadJson(CART_KEY, []))
  const [products, setProductsState] = useState(SEED_PRODUCTS)
  const [productsSource, setProductsSource] = useState(isFirebaseConfigured() ? 'loading' : 'seed')
  const [unreadEnquiries, setUnreadEnquiries] = useState(0)
  const [adminSettings, setAdminSettings] = useState(null)
  const [siteContent, setSiteContentState] = useState(DEFAULT_SITE_CONTENT)
  const [siteContentSource, setSiteContentSource] = useState(isFirebaseConfigured() ? 'loading' : 'static')
  const [sitePages, setSitePagesState] = useState(PAGE_META)
  const [sitePagesSource, setSitePagesSource] = useState(isFirebaseConfigured() ? 'loading' : 'static')
  const [toast, setToast] = useState(null)
  const [firebaseReady] = useState(isFirebaseConfigured())

  const setUser = useCallback((next) => {
    const normalized = next && next.role === 'admin' && !next.permissions?.length
      ? { ...next, permissions: DEFAULT_ADMIN_PERMISSIONS }
      : next
    setUserState(normalized)
    if (normalized) saveJson(USER_KEY, normalized)
    else localStorage.removeItem(USER_KEY)
  }, [])

  const setQuoteCart = useCallback((updater) => {
    setQuoteCartState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(CART_KEY, next)
      return next
    })
  }, [])

  const addToQuote = useCallback((product, qty = 1) => {
    setQuoteCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, qty: item.qty + qty }
            : item,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          category: product.category,
          src: product.src,
          unitPrice: product.quoteOnly ? null : product.startingPrice,
          quoteOnly: product.quoteOnly,
          itemType: 'product',
          qty,
        },
      ]
    })
  }, [setQuoteCart])

  const addServiceRequest = useCallback((service, options = {}) => {
    const { customTitle, customDescription, pricingItemName } = options
    const title = customTitle || pricingItemName || service.title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const productId = customTitle
      ? `service:custom-${Date.now()}`
      : `service:${slug}`

    const pricing = service.pricing || {}
    const quoteOnly = pricing.type === 'quote' || pricing.amount == null

    setQuoteCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [
        ...prev,
        {
          productId,
          title,
          category: 'Service',
          src: service.image || '',
          unitPrice: quoteOnly ? null : Number(pricing.amount) || null,
          quoteOnly,
          itemType: 'service',
          serviceDescription: customDescription || service.description || '',
          qty: 1,
        },
      ]
    })
  }, [setQuoteCart])

  const updateQuoteQty = useCallback((productId, qty) => {
    setQuoteCart((prev) => {
      if (qty <= 0) return prev.filter((item) => item.productId !== productId)
      return prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
    })
  }, [setQuoteCart])

  const removeFromQuote = useCallback((productId) => {
    setQuoteCart((prev) => prev.filter((item) => item.productId !== productId))
  }, [setQuoteCart])

  const clearQuote = useCallback(() => setQuoteCart([]), [setQuoteCart])

  const quoteCount = useMemo(
    () => quoteCart.reduce((sum, item) => sum + item.qty, 0),
    [quoteCart],
  )

  const quoteEstimate = useMemo(
    () =>
      quoteCart.reduce((sum, item) => {
        if (item.quoteOnly || item.unitPrice == null) return sum
        return sum + item.unitPrice * item.qty
      }, 0),
    [quoteCart],
  )

  const activeProducts = useMemo(
    () => [...products].filter((p) => p.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [products],
  )

  const saveProducts = useCallback(async (nextProducts) => {
    const normalized = nextProducts.map(normalizeProduct)
    setProductsState(normalized)
    if (firebaseReady && db) {
      await setDoc(PRODUCTS_DOC(), {
        items: normalized,
        updatedAt: serverTimestamp(),
      })
      setProductsSource('firestore')
    } else {
      localStorage.setItem('er_products_cache', JSON.stringify(normalized))
      setProductsSource('local')
    }
  }, [firebaseReady])

  const saveSiteContent = useCallback(async (nextContent) => {
    const payload = {
      services: nextContent.services,
      servicePricing: nextContent.servicePricing,
      budgetTiers: nextContent.budgetTiers,
      budgetNote: nextContent.budgetNote,
      updatedAt: serverTimestamp(),
    }
    setSiteContentState(nextContent)
    if (firebaseReady && db) {
      await setDoc(SITE_CONTENT_DOC(), payload)
      setSiteContentSource('firestore')
    } else {
      localStorage.setItem('er_site_content_cache', JSON.stringify({
        ...nextContent,
        updatedAt: new Date().toISOString(),
      }))
      setSiteContentSource('local')
    }
  }, [firebaseReady])

  const saveSitePages = useCallback(async (pages) => {
    setSitePagesState(pages)
    if (firebaseReady && db) {
      await setDoc(SITE_PAGES_DOC(), { pages, updatedAt: serverTimestamp() })
      setSitePagesSource('firestore')
    } else {
      localStorage.setItem('er_site_pages_cache', JSON.stringify(pages))
      setSitePagesSource('local')
    }
  }, [firebaseReady])

  // Site pages listener / bootstrap
  useEffect(() => {
    if (!firebaseReady || !db) {
      const cached = loadJson('er_site_pages_cache', null)
      if (cached) {
        setSitePagesState({ ...PAGE_META, ...cached })
        setSitePagesSource('local')
      }
      return undefined
    }

    const ref = SITE_PAGES_DOC()
    let cancelled = false

    const bootstrap = async () => {
      try {
        const snap = await getDoc(ref)
        if (cancelled) return
        if (snap.exists() && snap.data()?.pages) {
          setSitePagesState({ ...PAGE_META, ...snap.data().pages })
          setSitePagesSource('firestore')
        } else {
          await setDoc(ref, { pages: PAGE_META, seededAt: serverTimestamp() })
          setSitePagesState(PAGE_META)
          setSitePagesSource('firestore')
        }
      } catch (e) {
        console.warn('[AppContext] Site pages bootstrap failed:', e.message)
        setSitePagesSource('static')
      }
    }

    bootstrap()

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists() || !snap.data()?.pages) return
        setSitePagesState({ ...PAGE_META, ...snap.data().pages })
        setSitePagesSource('firestore')
      },
      (err) => console.warn('[AppContext] Site pages listener:', err.message),
    )

    return () => {
      cancelled = true
      unsub()
    }
  }, [firebaseReady])

  const userHasPermission = useCallback(
    (permission) => hasPermission(user, permission),
    [user],
  )

  const showToast = useCallback((message, options = {}) => {
    const { duration = 3200, actionHref, actionLabel } = options
    setToast({ message, actionHref, actionLabel })
    if (duration > 0) {
      setTimeout(() => setToast(null), duration)
    }
  }, [])

  // Admin settings listener
  useEffect(() => {
    loadAdminSettings().then(setAdminSettings)

    if (!firebaseReady || !db) return undefined

    const unsub = onSnapshot(
      doc(db, FS.SITE_DATA, FS.ADMIN_SETTINGS),
      (snap) => {
        if (snap.exists()) setAdminSettings(snap.data())
      },
      () => {},
    )
    return () => unsub()
  }, [firebaseReady])

  // Products listener / bootstrap
  useEffect(() => {
    if (!firebaseReady || !db) {
      const cached = loadJson('er_products_cache', null)
      if (cached?.length) {
        setProductsState(cached.map(normalizeProduct))
        setProductsSource('local')
      }
      return undefined
    }

    const ref = PRODUCTS_DOC()
    let cancelled = false

    const bootstrap = async () => {
      try {
        const snap = await getDoc(ref)
        if (cancelled) return
        if (snap.exists() && Array.isArray(snap.data()?.items) && snap.data().items.length) {
          setProductsState(snap.data().items.map(normalizeProduct))
          setProductsSource('firestore')
        } else {
          await setDoc(ref, { items: SEED_PRODUCTS, seededAt: serverTimestamp() })
          setProductsState(SEED_PRODUCTS)
          setProductsSource('firestore')
        }
      } catch (e) {
        console.warn('[AppContext] Products bootstrap failed:', e.message)
        setProductsSource('seed')
      }
    }

    bootstrap()

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return
        const items = snap.data()?.items
        if (Array.isArray(items) && items.length) {
          setProductsState(items.map(normalizeProduct))
          setProductsSource('firestore')
        }
      },
      (err) => console.warn('[AppContext] Products listener:', err.message),
    )

    return () => {
      cancelled = true
      unsub()
    }
  }, [firebaseReady])

  // Site content listener / bootstrap
  useEffect(() => {
    if (!firebaseReady || !db) {
      const cached = loadJson('er_site_content_cache', null)
      if (cached) {
        setSiteContentState({
          services: cached.services || DEFAULT_SITE_CONTENT.services,
          servicePricing: cached.servicePricing || DEFAULT_SITE_CONTENT.servicePricing,
          budgetTiers: cached.budgetTiers || DEFAULT_SITE_CONTENT.budgetTiers,
          budgetNote: cached.budgetNote || DEFAULT_SITE_CONTENT.budgetNote,
        })
        setSiteContentSource('local')
      }
      return undefined
    }

    const ref = SITE_CONTENT_DOC()
    let cancelled = false

    const bootstrap = async () => {
      try {
        const snap = await getDoc(ref)
        if (cancelled) return
        if (snap.exists()) {
          const data = snap.data()
          setSiteContentState({
            services: data.services || DEFAULT_SITE_CONTENT.services,
            servicePricing: data.servicePricing || DEFAULT_SITE_CONTENT.servicePricing,
            budgetTiers: data.budgetTiers || DEFAULT_SITE_CONTENT.budgetTiers,
            budgetNote: data.budgetNote || DEFAULT_SITE_CONTENT.budgetNote,
          })
          setSiteContentSource('firestore')
        } else {
          await setDoc(ref, { ...DEFAULT_SITE_CONTENT, seededAt: serverTimestamp() })
          setSiteContentState(DEFAULT_SITE_CONTENT)
          setSiteContentSource('firestore')
        }
      } catch (e) {
        console.warn('[AppContext] Site content bootstrap failed:', e.message)
        setSiteContentSource('static')
      }
    }

    bootstrap()

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return
        const data = snap.data()
        setSiteContentState({
          services: data.services || DEFAULT_SITE_CONTENT.services,
          servicePricing: data.servicePricing || DEFAULT_SITE_CONTENT.servicePricing,
          budgetTiers: data.budgetTiers || DEFAULT_SITE_CONTENT.budgetTiers,
          budgetNote: data.budgetNote || DEFAULT_SITE_CONTENT.budgetNote,
        })
        setSiteContentSource('firestore')
      },
      (err) => console.warn('[AppContext] Site content listener:', err.message),
    )

    return () => {
      cancelled = true
      unsub()
    }
  }, [firebaseReady])

  // Unread enquiries count
  useEffect(() => {
    const countLocal = () => {
      const localUnread = loadLocalQuoteRequests().filter((q) => !q.read).length
      return localUnread
    }

    if (!firebaseReady || !db) {
      setUnreadEnquiries(countLocal())
      const onStorage = () => setUnreadEnquiries(countLocal())
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    }

    const unsub = onSnapshot(
      collection(db, FS.QUOTE_REQUESTS),
      (snap) => {
        const firestoreUnread = snap.docs.filter((d) => {
          const data = d.data()
          return data.read !== true && (data.status === 'new' || !data.status)
        }).length
        setUnreadEnquiries(firestoreUnread + countLocal())
      },
      () => setUnreadEnquiries(countLocal()),
    )

    return () => unsub()
  }, [firebaseReady])

  const value = {
    user,
    setUser,
    isAdmin: canAccessAdmin(user),
    isSuperAdmin: isSuperAdmin(user),
    isStaff: isStaffRole(user),
    isClient: isClientRole(user),
    canAccessStaff: canAccessStaff(user),
    firebaseReady,
    adminSettings,
    setAdminSettings,
    products,
    activeProducts,
    productsSource,
    saveProducts,
    siteContent,
    siteContentSource,
    saveSiteContent,
    sitePages,
    sitePagesSource,
    saveSitePages,
    hasPermission: userHasPermission,
    userPermissions: getUserPermissions(user),
    toast,
    showToast,
    quoteCart,
    quoteCount,
    quoteEstimate,
    addToQuote,
    addServiceRequest,
    updateQuoteQty,
    removeFromQuote,
    clearQuote,
    unreadEnquiries,
    setUnreadEnquiries,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
