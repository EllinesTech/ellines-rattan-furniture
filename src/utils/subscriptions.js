import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'

const LOCAL_SUBS_KEY = 'er_local_subscriptions'

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

  const list = JSON.parse(localStorage.getItem(LOCAL_SUBS_KEY) || '[]')
  if (list.some((s) => s.email === emailKey)) {
    throw new Error('You are already subscribed.')
  }
  list.unshift({ email: emailKey, source, createdAt: new Date().toISOString() })
  localStorage.setItem(LOCAL_SUBS_KEY, JSON.stringify(list))
  return { email: emailKey }
}
