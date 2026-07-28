/**
 * Ellines Rattan Furniture — Firebase
 *
 * Project: ellines-haven-web (shared with Ellines Haven on Blaze).
 * Hosting remains Cloudflare Pages — do not firebase deploy hosting.
 *
 * Data is namespaced via src/firestorePaths.js so Haven books/users/admin
 * credentials are never overwritten.
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'info@ellines.co.ke').toLowerCase()

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'undefined' &&
    firebaseConfig.projectId !== 'undefined',
  )
}

let app = null
let db = null

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig)
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  } catch (e) {
    console.warn('[Firebase] Offline persistence unavailable:', e.message)
    db = getFirestore(app)
  }
}

export { app, db }
