import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'
import { SEED_TESTIMONIALS } from '../data/seedTestimonials'
import { SEED_POSTS, slugifyPostTitle } from '../data/seedPosts'
import { DEFAULT_PAGE_CONTENT } from '../data/seedPageContent'

const LOCAL_TESTIMONIALS = 'er_testimonials'
const LOCAL_POSTS = 'er_posts'
const LOCAL_PAGE_CONTENT = 'er_page_content'
const LOCAL_BOOKINGS = 'er_visit_bookings'
const LOCAL_TRADE = 'er_trade_enquiries'

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) ?? fallback
  } catch {
    return fallback
  }
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function tsNow() {
  return new Date().toISOString()
}

function normalizeTestimonial(raw, index = 0) {
  return {
    id: raw.id || `t_${index}`,
    quote: raw.quote || '',
    name: raw.name || '',
    role: raw.role || '',
    rating: Math.min(5, Math.max(1, Number(raw.rating) || 5)),
    photo: raw.photo || '',
    beforePhoto: raw.beforePhoto || '',
    afterPhoto: raw.afterPhoto || '',
    sortOrder: raw.sortOrder ?? index,
    active: raw.active !== false,
  }
}

function normalizePost(raw, index = 0) {
  const title = raw.title || 'Untitled'
  return {
    id: raw.id || `p_${index}`,
    title,
    slug: raw.slug || slugifyPostTitle(title) || `post-${index}`,
    excerpt: raw.excerpt || '',
    cover: raw.cover || '',
    body: raw.body || '',
    published: Boolean(raw.published),
    publishedAt: raw.publishedAt || null,
    sortOrder: raw.sortOrder ?? index,
  }
}

// ── Page content (brochure, calendly, financing, trade copy) ───────────────

export function mergePageContent(data) {
  const base = DEFAULT_PAGE_CONTENT
  if (!data) return { ...base, financing: { ...base.financing }, trade: { ...base.trade } }
  return {
    brochurePdfUrl: data.brochurePdfUrl ?? base.brochurePdfUrl,
    calendlyUrl: data.calendlyUrl ?? base.calendlyUrl,
    financing: { ...base.financing, ...(data.financing || {}) },
    trade: { ...base.trade, ...(data.trade || {}) },
  }
}

export async function loadPageContent() {
  if (isFirebaseConfigured() && db) {
    const snap = await getDoc(doc(db, FS.SITE_DATA, FS.PAGE_CONTENT))
    if (snap.exists()) return mergePageContent(snap.data())
    const seed = mergePageContent(null)
    await setDoc(doc(db, FS.SITE_DATA, FS.PAGE_CONTENT), {
      ...seed,
      seededAt: serverTimestamp(),
    })
    return seed
  }
  const local = loadLocal(LOCAL_PAGE_CONTENT, null)
  return mergePageContent(local)
}

export async function savePageContent(next, updatedBy = null) {
  const payload = mergePageContent(next)
  if (isFirebaseConfigured() && db) {
    await setDoc(
      doc(db, FS.SITE_DATA, FS.PAGE_CONTENT),
      { ...payload, updatedAt: serverTimestamp(), updatedBy },
      { merge: true },
    )
  } else {
    saveLocal(LOCAL_PAGE_CONTENT, { ...payload, updatedAt: tsNow() })
  }
  return payload
}

export function subscribePageContent(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(mergePageContent(loadLocal(LOCAL_PAGE_CONTENT, null)))
    return () => {}
  }
  return onSnapshot(
    doc(db, FS.SITE_DATA, FS.PAGE_CONTENT),
    (snap) => callback(mergePageContent(snap.exists() ? snap.data() : null)),
    () => callback(mergePageContent(null)),
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────

export async function ensureTestimonialsSeeded() {
  if (!isFirebaseConfigured() || !db) {
    const local = loadLocal(LOCAL_TESTIMONIALS, null)
    if (local?.length) return local.map(normalizeTestimonial)
    saveLocal(LOCAL_TESTIMONIALS, SEED_TESTIMONIALS)
    return SEED_TESTIMONIALS.map(normalizeTestimonial)
  }
  const snap = await getDocs(collection(db, FS.TESTIMONIALS))
  if (snap.empty) {
    await Promise.all(
      SEED_TESTIMONIALS.map((t) =>
        setDoc(doc(db, FS.TESTIMONIALS, t.id), {
          ...normalizeTestimonial(t),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    )
    return SEED_TESTIMONIALS.map(normalizeTestimonial)
  }
  return snap.docs.map((d, i) => normalizeTestimonial({ id: d.id, ...d.data() }, i))
}

export function subscribeTestimonials(callback) {
  if (!isFirebaseConfigured() || !db) {
    ensureTestimonialsSeeded().then(callback)
    return () => {}
  }
  let bootstrapped = false
  const unsub = onSnapshot(
    query(collection(db, FS.TESTIMONIALS), orderBy('sortOrder', 'asc')),
    async (snap) => {
      if (snap.empty && !bootstrapped) {
        bootstrapped = true
        const seeded = await ensureTestimonialsSeeded()
        callback(seeded)
        return
      }
      callback(snap.docs.map((d, i) => normalizeTestimonial({ id: d.id, ...d.data() }, i)))
    },
    async () => {
      const list = await ensureTestimonialsSeeded()
      callback(list)
    },
  )
  return unsub
}

export async function saveTestimonial(item) {
  const data = normalizeTestimonial(item)
  if (isFirebaseConfigured() && db) {
    const id = data.id?.startsWith('seed-') || data.id?.startsWith('t_new')
      ? data.id.startsWith('t_new')
        ? null
        : data.id
      : data.id
    if (id && !String(id).startsWith('t_new')) {
      await setDoc(
        doc(db, FS.TESTIMONIALS, id),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true },
      )
      return { ...data, id }
    }
    const refDoc = await addDoc(collection(db, FS.TESTIMONIALS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { ...data, id: refDoc.id }
  }
  const list = loadLocal(LOCAL_TESTIMONIALS, SEED_TESTIMONIALS).map(normalizeTestimonial)
  const idx = list.findIndex((t) => t.id === data.id)
  if (idx >= 0) list[idx] = data
  else {
    data.id = data.id?.startsWith('t_new') ? `local_${Date.now()}` : data.id || `local_${Date.now()}`
    list.push(data)
  }
  saveLocal(LOCAL_TESTIMONIALS, list)
  return data
}

export async function deleteTestimonial(id) {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, FS.TESTIMONIALS, id))
    return
  }
  const list = loadLocal(LOCAL_TESTIMONIALS, []).filter((t) => t.id !== id)
  saveLocal(LOCAL_TESTIMONIALS, list)
}

export async function saveTestimonialsOrder(items) {
  await Promise.all(
    items.map((item, index) =>
      saveTestimonial({ ...item, sortOrder: index }),
    ),
  )
}

// ── Posts / stories ────────────────────────────────────────────────────────

export async function ensurePostsSeeded() {
  if (!isFirebaseConfigured() || !db) {
    const local = loadLocal(LOCAL_POSTS, null)
    if (local?.length) return local.map(normalizePost)
    saveLocal(LOCAL_POSTS, SEED_POSTS)
    return SEED_POSTS.map(normalizePost)
  }
  const snap = await getDocs(collection(db, FS.POSTS))
  if (snap.empty) {
    await Promise.all(
      SEED_POSTS.map((p) =>
        setDoc(doc(db, FS.POSTS, p.id), {
          ...normalizePost(p),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    )
    return SEED_POSTS.map(normalizePost)
  }
  return snap.docs.map((d, i) => normalizePost({ id: d.id, ...d.data() }, i))
}

export function subscribePosts(callback, { publishedOnly = false } = {}) {
  if (!isFirebaseConfigured() || !db) {
    ensurePostsSeeded().then((list) => {
      callback(publishedOnly ? list.filter((p) => p.published) : list)
    })
    return () => {}
  }
  let bootstrapped = false
  const unsub = onSnapshot(
    query(collection(db, FS.POSTS), orderBy('sortOrder', 'asc')),
    async (snap) => {
      if (snap.empty && !bootstrapped) {
        bootstrapped = true
        const seeded = await ensurePostsSeeded()
        callback(publishedOnly ? seeded.filter((p) => p.published) : seeded)
        return
      }
      const list = snap.docs.map((d, i) => normalizePost({ id: d.id, ...d.data() }, i))
      callback(publishedOnly ? list.filter((p) => p.published) : list)
    },
    async () => {
      const list = await ensurePostsSeeded()
      callback(publishedOnly ? list.filter((p) => p.published) : list)
    },
  )
  return unsub
}

export async function getPostBySlug(slug) {
  if (!slug) return null
  if (isFirebaseConfigured() && db) {
    const q = query(collection(db, FS.POSTS), where('slug', '==', slug))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const d = snap.docs[0]
      return normalizePost({ id: d.id, ...d.data() })
    }
    // Fallback seed ids
    const list = await ensurePostsSeeded()
    return list.find((p) => p.slug === slug) || null
  }
  const list = await ensurePostsSeeded()
  return list.find((p) => p.slug === slug) || null
}

export async function savePost(item) {
  const data = normalizePost(item)
  if (!data.slug) data.slug = slugifyPostTitle(data.title)
  if (data.published && !data.publishedAt) data.publishedAt = tsNow()
  if (isFirebaseConfigured() && db) {
    if (data.id && !String(data.id).startsWith('p_new')) {
      await setDoc(
        doc(db, FS.POSTS, data.id),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true },
      )
      return data
    }
    const refDoc = await addDoc(collection(db, FS.POSTS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { ...data, id: refDoc.id }
  }
  const list = loadLocal(LOCAL_POSTS, SEED_POSTS).map(normalizePost)
  const idx = list.findIndex((p) => p.id === data.id)
  if (idx >= 0) list[idx] = data
  else {
    data.id = data.id?.startsWith('p_new') ? `local_${Date.now()}` : data.id || `local_${Date.now()}`
    list.push(data)
  }
  saveLocal(LOCAL_POSTS, list)
  return data
}

export async function deletePost(id) {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, FS.POSTS, id))
    return
  }
  saveLocal(
    LOCAL_POSTS,
    loadLocal(LOCAL_POSTS, []).filter((p) => p.id !== id),
  )
}

// ── Visit bookings ─────────────────────────────────────────────────────────

export async function createVisitBooking(payload) {
  const data = {
    name: payload.name?.trim() || '',
    phone: payload.phone?.trim() || '',
    email: (payload.email || '').trim().toLowerCase() || null,
    purpose: payload.purpose || 'showroom',
    preferredDate: payload.preferredDate || '',
    preferredTime: payload.preferredTime || '',
    notes: payload.notes?.trim() || '',
    status: 'new',
    read: false,
    userId: payload.userId || null,
    source: payload.source || 'visit_form',
  }
  if (isFirebaseConfigured() && db) {
    const refDoc = await addDoc(collection(db, FS.VISIT_BOOKINGS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: refDoc.id, ...data, createdAt: tsNow() }
  }
  const list = loadLocal(LOCAL_BOOKINGS, [])
  const saved = { id: `local_b_${Date.now()}`, ...data, createdAt: tsNow() }
  list.unshift(saved)
  saveLocal(LOCAL_BOOKINGS, list)
  return saved
}

export function subscribeVisitBookings(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(loadLocal(LOCAL_BOOKINGS, []))
    return () => {}
  }
  return onSnapshot(
    query(collection(db, FS.VISIT_BOOKINGS), orderBy('createdAt', 'desc')),
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      )
    },
    () => callback(loadLocal(LOCAL_BOOKINGS, [])),
  )
}

export async function updateVisitBooking(id, patch) {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, FS.VISIT_BOOKINGS, id), {
      ...patch,
      updatedAt: serverTimestamp(),
    })
    return
  }
  const list = loadLocal(LOCAL_BOOKINGS, []).map((b) =>
    b.id === id ? { ...b, ...patch, updatedAt: tsNow() } : b,
  )
  saveLocal(LOCAL_BOOKINGS, list)
}

// ── Trade enquiries ────────────────────────────────────────────────────────

export async function createTradeEnquiry(payload) {
  const data = {
    name: payload.name?.trim() || '',
    company: payload.company?.trim() || '',
    phone: payload.phone?.trim() || '',
    email: (payload.email || '').trim().toLowerCase() || null,
    projectType: payload.projectType || 'hospitality',
    message: payload.message?.trim() || '',
    samplesNote: payload.samplesNote?.trim() || '',
    status: 'new',
    read: false,
    userId: payload.userId || null,
  }
  if (isFirebaseConfigured() && db) {
    const refDoc = await addDoc(collection(db, FS.TRADE_ENQUIRIES), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: refDoc.id, ...data, createdAt: tsNow() }
  }
  const list = loadLocal(LOCAL_TRADE, [])
  const saved = { id: `local_tr_${Date.now()}`, ...data, createdAt: tsNow() }
  list.unshift(saved)
  saveLocal(LOCAL_TRADE, list)
  return saved
}

export function subscribeTradeEnquiries(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(loadLocal(LOCAL_TRADE, []))
    return () => {}
  }
  return onSnapshot(
    query(collection(db, FS.TRADE_ENQUIRIES), orderBy('createdAt', 'desc')),
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    },
    () => callback(loadLocal(LOCAL_TRADE, [])),
  )
}

export async function updateTradeEnquiry(id, patch) {
  if (isFirebaseConfigured() && db) {
    await updateDoc(doc(db, FS.TRADE_ENQUIRIES, id), {
      ...patch,
      updatedAt: serverTimestamp(),
    })
    return
  }
  const list = loadLocal(LOCAL_TRADE, []).map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: tsNow() } : t,
  )
  saveLocal(LOCAL_TRADE, list)
}

// ── Uploads (images + PDF brochure) ────────────────────────────────────────

export async function uploadCmsFile(file, { folder = 'cms', uploadedBy = null } = {}) {
  if (!file) throw new Error('Choose a file.')
  if (!isFirebaseConfigured() || !storage) {
    throw new Error('Firebase Storage is not configured.')
  }
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
  const isImage = /^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)
  if (!isPdf && !isImage) throw new Error('Use an image or PDF.')
  const max = isPdf ? 15 * 1024 * 1024 : 5 * 1024 * 1024
  if (file.size > max) throw new Error(isPdf ? 'PDF must be under 15 MB.' : 'Image must be under 5 MB.')

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
  const path = `rattan-media/${folder}/${Date.now()}-${safeName}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, { contentType: file.type || (isPdf ? 'application/pdf' : undefined) })
  const url = await getDownloadURL(storageRef)
  return { url, storagePath: path, contentType: file.type, uploadedBy }
}

export { slugifyPostTitle }
