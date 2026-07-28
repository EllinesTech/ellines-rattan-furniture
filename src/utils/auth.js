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
import {
  ALL_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  normalizePermissions,
} from './permissions'
import {
  syncFirebaseAuthSession,
  provisionFirebaseAuthUser,
  clearFirebaseAuthSession,
} from './firebaseAuthSession'

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

export {
  PERMISSIONS,
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  DEFAULT_ADMIN_PERMISSIONS,
  getUserPermissions,
  hasPermission,
  canManageAdmins,
} from './permissions'

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
    await syncFirebaseAuthSession(emailKey, password)
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

  await syncFirebaseAuthSession(emailKey, password)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role || ROLES.CLIENT,
  }
}

export async function listAdminAccounts() {
  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
      if (!snap.exists()) return []
      const admins = snap.data()?.accounts || []
      return admins.map((a) => ({
        ...a,
        permissions: a.role === ROLES.SUPERADMIN ? ALL_PERMISSIONS : normalizePermissions(a.permissions),
      }))
    } catch (e) {
      console.warn('[listAdminAccounts]', e.message)
    }
  }
  return []
}

export async function createAdminAccount({ name, email, phone, password, permissions }, createdBy) {
  const emailKey = email.toLowerCase().trim()
  const existing = await findUserByEmail(emailKey)
  if (existing) throw new Error('A user with this email already exists.')

  const snap = isFirebaseConfigured() && db
    ? await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
    : null
  const admins = snap?.exists() ? snap.data()?.accounts || [] : []
  if (admins.some((a) => (a.email || '').toLowerCase() === emailKey)) {
    throw new Error('This email is already an admin account.')
  }

  const hashed = await storePasswordValue(password)
  const perms = normalizePermissions(permissions?.length ? permissions : DEFAULT_ADMIN_PERMISSIONS)
  const entry = {
    email: emailKey,
    name: name.trim(),
    phone: (phone || '').trim(),
    role: ROLES.ADMIN,
    permissions: perms,
    id: `admin_${Date.now()}`,
    password: hashed,
    createdBy: createdBy?.email || null,
    createdAt: new Date().toISOString(),
    active: true,
  }

  if (isFirebaseConfigured() && db) {
    const pwMap = snap?.data()?.pwOverrides || {}
    await setDoc(
      doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS),
      {
        accounts: [...admins, entry],
        pwOverrides: { ...pwMap, [emailKey]: hashed },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  await provisionFirebaseAuthUser(emailKey, password)
  return { ...entry, password: undefined }
}

export async function updateAdminAccount(email, patch, actor) {
  const emailKey = email.toLowerCase().trim()
  if (!isFirebaseConfigured() || !db) throw new Error('Firebase required to manage admins.')

  const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
  const data = snap.exists() ? snap.data() || {} : {}
  const admins = data.accounts || []
  const target = admins.find((a) => (a.email || '').toLowerCase() === emailKey)
  if (!target) throw new Error('Admin account not found.')
  if (target.role === ROLES.SUPERADMIN) throw new Error('Cannot modify the super admin account here.')

  const nextAccounts = admins.map((a) => {
    if ((a.email || '').toLowerCase() !== emailKey) return a
    const updated = { ...a, ...patch, email: emailKey }
    if (patch.permissions) {
      updated.permissions = normalizePermissions(patch.permissions)
    }
    if (patch.password) {
      delete updated.password
    }
    updated.updatedBy = actor?.email || null
    updated.updatedAt = new Date().toISOString()
    return updated
  })

  const payload = { accounts: nextAccounts, updatedAt: serverTimestamp() }
  if (patch.password) {
    const hashed = await storePasswordValue(patch.password)
    payload.pwOverrides = { ...(data.pwOverrides || {}), [emailKey]: hashed }
  }

  await setDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS), payload, { merge: true })
  return nextAccounts.find((a) => (a.email || '').toLowerCase() === emailKey)
}

export async function removeAdminAccount(email, actor) {
  const emailKey = email.toLowerCase().trim()
  if (!isFirebaseConfigured() || !db) throw new Error('Firebase required to manage admins.')

  const snap = await getDoc(doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS))
  const data = snap.exists() ? snap.data() || {} : {}
  const admins = data.accounts || []
  const target = admins.find((a) => (a.email || '').toLowerCase() === emailKey)
  if (!target) throw new Error('Admin account not found.')
  if (target.role === ROLES.SUPERADMIN) throw new Error('Cannot remove the super admin account.')

  const pwMap = { ...(data.pwOverrides || {}) }
  delete pwMap[emailKey]

  await setDoc(
    doc(db, FS.SITE_DATA, FS.ADMIN_CREDENTIALS),
    {
      accounts: admins.filter((a) => (a.email || '').toLowerCase() !== emailKey),
      pwOverrides: pwMap,
      updatedAt: serverTimestamp(),
      lastRemovedBy: actor?.email || null,
    },
    { merge: true },
  )
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
    await provisionFirebaseAuthUser(emailKey, password)
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
        return {
          ...byEmail,
          permissions: byEmail.role === ROLES.SUPERADMIN
            ? ALL_PERMISSIONS
            : normalizePermissions(byEmail.permissions || DEFAULT_ADMIN_PERMISSIONS),
        }
      }

      if (admins.length === 0 && emailKey === superEmail) {
        const hashed = await storePasswordValue(password)
        const bootstrapEntry = {
          email: superEmail,
          role: ROLES.SUPERADMIN,
          name: 'Admin',
          id: 'admin01',
          password: hashed,
          permissions: ALL_PERMISSIONS,
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
    await syncFirebaseAuthSession(email, password)
    return {
      id: admin.id || 'admin01',
      name: admin.name || 'Admin',
      email: admin.email,
      role: admin.role || ROLES.ADMIN,
      permissions: admin.role === ROLES.SUPERADMIN
        ? ALL_PERMISSIONS
        : normalizePermissions(admin.permissions || DEFAULT_ADMIN_PERMISSIONS),
    }
  }

  const portal = await loginPortalUser(email, password)
  if (portal) return portal

  return null
}

export async function signOutUser() {
  await clearFirebaseAuthSession()
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
  const typeLabels = {
    budget_request: 'budget estimate',
    service_request: 'service request',
    formal_quote: 'formal quote',
  }
  const requestLabel = typeLabels[request.requestType] || 'quote'

  const lines = [
    `Hello Ellines Rattan Furniture,`,
    ``,
    `I would like to submit a ${requestLabel}.`,
    ``,
    `*Name:* ${request.customer.name}`,
    `*Phone:* ${request.customer.phone}`,
    `*Email:* ${request.customer.email || '—'}`,
    `*Location:* ${request.customer.location || '—'}`,
    `*Preferred contact:* ${request.preferredContact}`,
  ]
  if (request.budget) lines.push(`*Budget:* ${request.budget}`)
  if (request.budgetTier) lines.push(`*Budget tier:* ${request.budgetTier}`)

  const services = (request.items || []).filter((i) => i.itemType === 'service')
  const products = (request.items || []).filter((i) => i.itemType !== 'service')

  if (services.length) {
    lines.push('', '*Services requested:*')
    services.forEach((item) => {
      const price = item.quoteOnly ? 'Quote only' : formatKes(item.unitPrice)
      lines.push(`• ${item.title} × ${item.qty} (${price})`)
      if (item.serviceDescription) lines.push(`  _${item.serviceDescription}_`)
    })
  }

  if (products.length) {
    lines.push('', '*Products:*')
    products.forEach((item) => {
      const price = item.quoteOnly ? 'Quote only' : formatKes(item.unitPrice)
      const frame = item.frameMaterial ? ` · Frame: ${item.frameMaterial}` : ''
      const weave = item.weaveMaterial ? ` · Weave: ${item.weaveMaterial}` : ''
      lines.push(`• ${item.title} × ${item.qty} (${price})${weave}${frame}`)
    })
  }

  if (!services.length && !products.length && request.items?.length) {
    lines.push('', '*Items:*')
    request.items.forEach((item) => {
      const price = item.quoteOnly ? 'Quote only' : formatKes(item.unitPrice)
      const frame = item.frameMaterial ? ` · Frame: ${item.frameMaterial}` : ''
      lines.push(`• ${item.title} × ${item.qty} (${price})${frame}`)
    })
  }
  if (request.estimatedTotal > 0) {
    lines.push('', `*Estimated total:* ${formatKes(request.estimatedTotal)}`)
  }
  if (request.notes) lines.push('', `*Notes:* ${request.notes}`)
  return lines.join('\n')
}

export function buildQuoteMailto(request, toEmail) {
  const typeLabels = {
    budget_request: 'Budget request',
    service_request: 'Service request',
    formal_quote: 'Quote request',
  }
  const subject = encodeURIComponent(
    `${typeLabels[request.requestType] || 'Quote request'} — ${request.customer.name}`,
  )
  const body = encodeURIComponent(buildQuoteWhatsAppMessage(request))
  return `mailto:${toEmail}?subject=${subject}&body=${body}`
}
