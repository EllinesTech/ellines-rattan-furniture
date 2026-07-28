import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'
import { SEED_MEDIA_LIBRARY } from '../data/seedMedia'

export async function listMediaLibrary() {
  if (!isFirebaseConfigured() || !db) {
    return SEED_MEDIA_LIBRARY.map((m, i) => ({ id: `seed_${i}`, ...m }))
  }
  try {
    const snap = await getDocs(collection(db, FS.MEDIA))
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    }
  } catch (e) {
    console.warn('[listMediaLibrary]', e.message)
  }
  return SEED_MEDIA_LIBRARY.map((m, i) => ({ id: `seed_${i}`, ...m }))
}

/** Registers all canonical site images in Firestore media library (skips duplicates by src). */
export async function seedMediaLibrary() {
  if (!isFirebaseConfigured() || !db) {
    return { added: 0, total: SEED_MEDIA_LIBRARY.length, mode: 'local' }
  }

  const snap = await getDocs(collection(db, FS.MEDIA))
  const existing = new Set(snap.docs.map((d) => d.data()?.src).filter(Boolean))
  let added = 0

  for (const item of SEED_MEDIA_LIBRARY) {
    if (existing.has(item.src)) continue
    await addDoc(collection(db, FS.MEDIA), {
      ...item,
      seeded: true,
      createdAt: serverTimestamp(),
    })
    existing.add(item.src)
    added += 1
  }

  return { added, total: existing.size, mode: 'firebase' }
}
