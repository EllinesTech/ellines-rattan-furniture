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
import { loadLocalQuoteRequests, loadAdminSettings } from '../utils/auth'
import {
  isSuperAdmin,
  isAdminRole,
  isStaffRole,
  isClientRole,
  canAccessAdmin,
  canAccessStaff,
} from '../utils/roles'

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
  const [user, setUserState] = useState(() => loadJson(USER_KEY, null))
  const [quoteCart, setQuoteCartState] = useState(() => loadJson(CART_KEY, []))
  const [products, setProductsState] = useState(SEED_PRODUCTS)
  const [productsSource, setProductsSource] = useState(isFirebaseConfigured() ? 'loading' : 'seed')
  const [unreadEnquiries, setUnreadEnquiries] = useState(0)
  const [adminSettings, setAdminSettings] = useState(null)
  const [firebaseReady] = useState(isFirebaseConfigured())

  const setUser = useCallback((next) => {
    setUserState(next)
    if (next) saveJson(USER_KEY, next)
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
          qty,
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
    quoteCart,
    quoteCount,
    quoteEstimate,
    addToQuote,
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
