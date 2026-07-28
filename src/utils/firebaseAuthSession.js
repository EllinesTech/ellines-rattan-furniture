/**
 * Bridge custom app login → Firebase Auth so Firestore/Storage rules can use request.auth.
 * Uses a secondary app when provisioning other users so the admin session is not replaced.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { deleteApp, initializeApp } from 'firebase/app'
import { auth, isFirebaseConfigured } from '../firebase'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export async function syncFirebaseAuthSession(email, password) {
  if (!isFirebaseConfigured() || !auth || !email || !password) return false
  const emailKey = email.toLowerCase().trim()
  try {
    await signInWithEmailAndPassword(auth, emailKey, password)
    return true
  } catch (err) {
    const code = err?.code || ''
    if (
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-login-credentials'
    ) {
      try {
        await createUserWithEmailAndPassword(auth, emailKey, password)
        return true
      } catch (createErr) {
        if (createErr?.code === 'auth/email-already-in-use') {
          console.warn(
            '[Firebase Auth] Account exists with a different password. Enable Email/Password and reset if needed.',
          )
          return false
        }
        if (createErr?.code === 'auth/operation-not-allowed') {
          console.warn('[Firebase Auth] Enable Email/Password sign-in in Firebase Console.')
          return false
        }
        console.warn('[Firebase Auth] create failed:', createErr.message)
        return false
      }
    }
    if (code === 'auth/operation-not-allowed') {
      console.warn('[Firebase Auth] Enable Email/Password sign-in in Firebase Console.')
    } else {
      console.warn('[Firebase Auth] sign-in failed:', err.message)
    }
    return false
  }
}

/** Create Auth user without switching the current signed-in admin. */
export async function provisionFirebaseAuthUser(email, password) {
  if (!isFirebaseConfigured() || !email || !password || password.length < 6) return false
  const emailKey = email.toLowerCase().trim()
  const secondary = initializeApp(firebaseConfig, `provision-${Date.now()}`)
  try {
    await createUserWithEmailAndPassword(
      (await import('firebase/auth')).getAuth(secondary),
      emailKey,
      password,
    )
    return true
  } catch (err) {
    if (err?.code === 'auth/email-already-in-use') return true
    console.warn('[Firebase Auth] provision failed:', err.message)
    return false
  } finally {
    try {
      await deleteApp(secondary)
    } catch {
      /* ignore */
    }
  }
}

export async function clearFirebaseAuthSession() {
  if (!auth) return
  try {
    await signOut(auth)
  } catch {
    /* ignore */
  }
}

export function getFirebaseAuthUid() {
  return auth?.currentUser?.uid || null
}