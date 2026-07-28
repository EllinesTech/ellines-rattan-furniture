import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'

const LOCAL_SUBS_KEY = 'er_local_subscriptions'

function loadLocalSubscriptions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SUBS_KEY) || '[]')
  } catch {
    return []
  }
}

export async function subscribeNewsletter(email, source = 'footer') {
  const emailKey = email.toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey)) {
    throw new Error('Please enter a valid email.')
  }

  if (isFirebaseConfigured() && db) {
    await addDoc(collection(db, FS.SUBSCRIPTIONS), {
      email: emailKey,
      source,
      createdAt: serverTimestamp(),
    })
    return { email: emailKey }
  }

  const list = loadLocalSubscriptions()
  if (list.some((s) => s.email === emailKey)) {
    throw new Error('You are already subscribed.')
  }
  list.unshift({ email: emailKey, source, createdAt: new Date().toISOString(), _local: true })
  localStorage.setItem(LOCAL_SUBS_KEY, JSON.stringify(list))
  return { email: emailKey }
}

export async function listSubscriptions() {
  const local = loadLocalSubscriptions()
  if (!isFirebaseConfigured() || !db) return local

  try {
    const snap = await getDocs(query(collection(db, FS.SUBSCRIPTIONS), orderBy('createdAt', 'desc')))
    const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const map = new Map()
    ;[...remote, ...local].forEach((s) => {
      const key = (s.email || '').toLowerCase()
      if (key && !map.has(key)) map.set(key, s)
    })
    return [...map.values()]
  } catch {
    return local
  }
}
