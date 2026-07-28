import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured, SUPER_ADMIN_EMAIL as ENV_SUPER_ADMIN_EMAIL } from '../firebase'
import { FS } from '../firestorePaths'
import { storePasswordValue, verifyPassword } from './passwordSecurity'
import { ROLES } from './roles'

const DEV_ADMIN_KEY = 'er_dev_admin_hash'
const LOCAL_QUOTES_KEY = 'er_local_quote_requests'
const LOCAL_USERS_KEY = 'er_local_users'
const LOCAL_ADMIN_SETTINGS_KEY = 'er_admin_settings'

export { ROLES }
export {
  isSuperAdmin,
  isAdminRole,
  isStaffRole,
  isClientRole,
  canAccessAdmin,
  canAccessStaff,
  getPostLoginRoute,
  getRoleLabel,
} from './roles'

export function isDevAdminMode() {
  return !isFirebaseConfigured() && Boolean(import.meta.env.VITE_DEV_ADMIN_PASSWORD)
}

function loadLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

export async function loadAdminSettings() {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_SETTINGS))
      if (snap.exists()) return snap.data()
    } catch (e) {
      console.warn('[loadAdminSettings]', e.message)
    }
  }
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_ADMIN_SETTINGS_KEY) || 'null')
    if (local) return local
  } catch {
    /* ignore */
  }
  return {
    superAdminEmail: ENV_SUPER_ADMIN_EMAIL,
    notificationEmail: 'info@ellines.co.ke',
  }
}

export async function saveAdminSettings(settings, actorEmail) {
  const payload = {
    superAdminEmail: (settings.superAdminEmail || ENV_SUPER_ADMIN_EMAIL).toLowerCase().trim(),
    notificationEmail: (settings.notificationEmail || 'info@ellines.co.ke').toLowerCase().trim(),
    updatedAt: serverTimestamp(),
    updatedBy: actorEmail || null,
  }

  if (isFirebaseConfigured() && db) {
    await setDoc(doc(db, FS.SITE_DATA, FS.ADMIN_SETTINGS), payload, { merge: true })
  } else {
    localStorage.setItem(
      LOCAL_ADMIN_SETTINGS_KEY,
      JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    )
  }
  return payload
}

export async function getSuperAdminEmail() {
  const settings = await loadAdminSettings()
  return (settings.superAdminEmail || ENV_SUPER_ADMIN_EMAIL).toLowerCase()
}

export async function findUserByEmail(email) {
  const emailKey = email.toLowerCase().trim()
  if (!emailKey) return null

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, FS.USERS), where('email', '==', emailKey))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0]
        return { id: d.id, ...d.data() }
      }
    } catch (e) {
      console.warn('[findUserByEmail]', e.message)
    }
  }

  return loadLocalUsers().find((u) => (u.email || '').toLowerCase() === emailKey) || null
}

export async function registerClient({ name, email, phone, password }) {
  const emailKey = email.toLowerCase().trim()
  const existing = await findUserByEmail(emailKey)
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const hashed = await storePasswordValue(password)
  const userData = {
    name: name.trim(),
    email: emailKey,
    phone: phone.trim(),
    role: ROLES.CLIENT,
    password: hashed,
    createdAt: new Date().toISOString(),
    source: 'rattan',
  }

  if (isFirebaseConfigured() && db) {
    const ref = await addDoc(collection(db, FS.USERS), {
      ...userData,
      createdAt: serverTimestamp(),
    })
    return { id: ref.id, ...userData, password: undefined }
  }

  const id = `local_user_${Date.now()}`
  const entry = { id, ...userData }
  saveLocalUsers([entry, ...loadLocalUsers()])
  return { ...entry, password: undefined }
}

export async function loginPortalUser(email, password) {
  const emailKey = email.toLowerCase().trim()
  const user = await findUserByEmail(emailKey)
  if (!user || !user.password) return null

  const check = await verifyPassword(password, user.password)
  if (!check.ok) return null

  if (check.needsUpgrade) {
    const hashed = await storePasswordValue(password)
    if (isFirebaseConfigured() && db && user.id && !user.id.startsWith('local_')) {
      await setDoc(doc(db, FS.USERS, user.id), { password: hashed, updatedAt: serverTimestamp() }, { merge: true })
    } else {
      const users = loadLocalUsers().map((u) =>
        u.id === user.id ? { ...u, password: hashed } : u,
      )
      saveLocalUsers(users)
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role || ROLES.CLIENT,
  }
}

export async function createStaffAccount({ name, email, phone, password }, createdBy) {
  const emailKey = email.toLowerCase().trim()
  const existing = await findUserByEmail(emailKey)
  if (existing) throw new Error('A user with this email already exists.')

  if (isFirebaseConfigured() && db) {
    const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
    const admins = snap.exists() ? snap.data()?.accounts || [] : []
    if (admins.some((a) => (a.email || '').toLowerCase() === emailKey)) {
      throw new Error('This email is already an admin account.')
    }
  }

  const hashed = await storePasswordValue(password)
  const userData = {
    name: name.trim(),
    email: emailKey,
    phone: (phone || '').trim(),
    role: ROLES.STAFF,
    password: hashed,
    createdBy: createdBy?.email || null,
    createdAt: new Date().toISOString(),
    active: true,
    source: 'rattan',
  }

  if (isFirebaseConfigured() && db) {
    const ref = await addDoc(collection(db, FS.USERS), {
      ...userData,
      createdAt: serverTimestamp(),
    })
    return { id: ref.id, ...userData, password: undefined }
  }

  const id = `local_staff_${Date.now()}`
  const entry = { id, ...userData }
  saveLocalUsers([entry, ...loadLocalUsers()])
  return { ...entry, password: undefined }
}

export async function listStaffAccounts() {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, FS.USERS))
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === ROLES.STAFF || u.role === ROLES.CLIENT)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } catch (e) {
      console.warn('[listStaffAccounts]', e.message)
    }
  }
  return loadLocalUsers().filter((u) => u.role === ROLES.STAFF || u.role === ROLES.CLIENT)
}

export async function listStaffOnly() {
  const all = await listStaffAccounts()
  return all.filter((u) => u.role === ROLES.STAFF)
}

export async function checkAdminCredentials(email, password) {
  const emailKey = email.toLowerCase()
  const superEmail = await getSuperAdminEmail()

  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
      const data = snap.exists() ? snap.data() || {} : null
      const admins = data?.accounts || []

      const byEmail = admins.find((a) => (a.email || '').toLowerCase() === emailKey)
      if (byEmail) {
        const pwMap = data.pwOverrides || {}
        const stored = pwMap[emailKey] || byEmail.password || ''
        if (!stored) return null
        const check = await verifyPassword(password, stored)
        if (!check.ok) return null
        if (check.needsUpgrade) {
          const hashed = await storePasswordValue(password)
          const nextAccounts = admins.map((a) =>
            (a.email || '').toLowerCase() === emailKey ? { ...a, password: hashed } : a,
          )
          await setDoc(
            doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS),
            {
              accounts: nextAccounts,
              pwOverrides: { ...pwMap, [emailKey]: hashed },
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        }
        return byEmail
      }

      if (admins.length === 0 && emailKey === superEmail) {
        const hashed = await storePasswordValue(password)
        const bootstrapEntry = {
          email: superEmail,
          role: ROLES.SUPERADMIN,
          name: 'Admin',
          id: 'admin01',
          password: hashed,
        }
        await setDoc(
          doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS),
          {
            accounts: [bootstrapEntry],
            pwOverrides: { [emailKey]: hashed },
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
        await saveAdminSettings(
          { superAdminEmail: superEmail, notificationEmail: 'info@ellines.co.ke' },
          superEmail,
        )
        return bootstrapEntry
      }
    } catch (e) {
      console.warn('[checkAdminCredentials]', e.message)
    }
    return null
  }

  if (isDevAdminMode() && emailKey === superEmail) {
    const devPassword = import.meta.env.VITE_DEV_ADMIN_PASSWORD
    let storedHash = localStorage.getItem(DEV_ADMIN_KEY)
    if (!storedHash) {
      storedHash = await storePasswordValue(devPassword)
      localStorage.setItem(DEV_ADMIN_KEY, storedHash)
    }
    const check = await verifyPassword(password, storedHash)
    if (!check.ok) return null
    return {
      email: superEmail,
      role: ROLES.SUPERADMIN,
      name: 'Admin',
      id: 'admin01',
    }
  }

  return null
}

/** Unified sign-in: admin credentials, staff users, or clients */
export async function authenticateUser(email, password) {
  const admin = await checkAdminCredentials(email, password)
  if (admin) {
    return {
      id: admin.id || 'admin01',
      name: admin.name || 'Admin',
      email: admin.email,
      role: admin.role || ROLES.ADMIN,
    }
  }

  const portal = await loginPortalUser(email, password)
  if (portal) return portal

  return null
}

export async function updateSuperAdminEmail(newEmail, currentPassword, currentUser) {
  const emailKey = newEmail.toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey)) {
    throw new Error('Please enter a valid email address.')
  }

  const verified = await checkAdminCredentials(currentUser.email, currentPassword)
  if (!verified || verified.role !== ROLES.SUPERADMIN) {
    throw new Error('Current password is incorrect.')
  }

  if (isFirebaseConfigured() && db) {
    const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
    const data = snap.exists() ? snap.data() || {} : {}
    const admins = data.accounts || []
    const oldKey = currentUser.email.toLowerCase()
    const pwMap = { ...(data.pwOverrides || {}) }

    const nextAccounts = admins.map((a) => {
      if ((a.email || '').toLowerCase() === oldKey) {
        return { ...a, email: emailKey, role: ROLES.SUPERADMIN }
      }
      return a
    })

    if (pwMap[oldKey]) {
      pwMap[emailKey] = pwMap[oldKey]
      delete pwMap[oldKey]
    }

    await setDoc(
      doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS),
      { accounts: nextAccounts, pwOverrides: pwMap, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  const settings = await loadAdminSettings()
  await saveAdminSettings({ ...settings, superAdminEmail: emailKey }, emailKey)

  return emailKey
}

export function loadLocalQuoteRequests() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_QUOTES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveLocalQuoteRequest(request) {
  const existing = loadLocalQuoteRequests()
  const entry = {
    ...request,
    id: `local_${Date.now()}`,
    status: 'new',
    read: false,
    createdAt: new Date().toISOString(),
    source: 'local',
  }
  localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify([entry, ...existing]))
  return entry
}

export function updateLocalQuoteRequest(id, patch) {
  const list = loadLocalQuoteRequests().map((q) => (q.id === id ? { ...q, ...patch } : q))
  localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(list))
}

export function formatKes(amount) {
  if (amount == null || Number.isNaN(amount)) return 'Price on request'
  return `KSh ${Number(amount).toLocaleString('en-KE')}`
}

export function buildWhatsAppLink({ phone, message }) {
  const num = String(phone || '').replace(/\D/g, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export function buildQuoteWhatsAppMessage(request) {
  const lines = [
    `Hello Ellines Rattan Furniture,`,
    ``,
    `I would like to request a ${request.requestType === 'budget_request' ? 'budget estimate' : 'formal quote'}.`,
    ``,
    `*Name:* ${request.customer.name}`,
    `*Phone:* ${request.customer.phone}`,
    `*Email:* ${request.customer.email || '—'}`,
    `*Location:* ${request.customer.location || '—'}`,
    `*Preferred contact:* ${request.preferredContact}`,
  ]
  if (request.budget) lines.push(`*Budget:* ${request.budget}`)
  lines.push('', '*Items:*')
  request.items.forEach((item) => {
    const price = item.quoteOnly ? 'Quote only' : formatKes(item.unitPrice)
    lines.push(`• ${item.title} × ${item.qty} (${price})`)
  })
  if (request.estimatedTotal > 0) {
    lines.push('', `*Estimated total:* ${formatKes(request.estimatedTotal)}`)
  }
  if (request.notes) lines.push('', `*Notes:* ${request.notes}`)
  return lines.join('\n')
}

export function buildQuoteMailto(request, toEmail) {
  const subject = encodeURIComponent(
    `${request.requestType === 'budget_request' ? 'Budget request' : 'Quote request'} — ${request.customer.name}`,
  )
  const body = encodeURIComponent(buildQuoteWhatsAppMessage(request))
  return `mailto:${toEmail}?subject=${subject}&body=${body}`
}
