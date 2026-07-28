import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, storage, isFirebaseConfigured } from '../firebase'
import { FS } from '../firestorePaths'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = /^image\/(jpeg|jpg|png|webp|gif)$/i

export async function uploadMediaFile(file, { alt = '', category = 'Projects', uploadedBy = null } = {}) {
  if (!file) throw new Error('Choose an image file.')
  if (!ALLOWED.test(file.type)) throw new Error('Use JPG, PNG, WebP, or GIF.')
  if (file.size > MAX_BYTES) throw new Error('Image must be under 5 MB.')

  if (!isFirebaseConfigured() || !storage || !db) {
    throw new Error('Firebase Storage is not configured.')
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
  const path = `rattan-media/${Date.now()}-${safeName}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file, { contentType: file.type })
  const src = await getDownloadURL(storageRef)

  const item = {
    src,
    storagePath: path,
    alt: alt || file.name,
    category,
    contentType: file.type,
    size: file.size,
    uploadedBy,
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, FS.MEDIA), item)
  return { id: docRef.id, ...item, createdAt: new Date().toISOString() }
}

export async function deleteMediaItem(item) {
  if (!item?.id) throw new Error('Missing media id.')
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, FS.MEDIA, item.id))
  }
  if (item.storagePath && storage) {
    try {
      await deleteObject(ref(storage, item.storagePath))
    } catch (e) {
      console.warn('[deleteMediaItem] storage:', e.message)
    }
  }
}
