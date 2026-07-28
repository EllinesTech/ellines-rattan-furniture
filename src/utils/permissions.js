/** Admin panel permissions — super admin always has all. */
export const PERMISSIONS = {
  ENQUIRIES: 'enquiries',
  PRODUCTS: 'products',
  SERVICES: 'services',
  STAFF: 'staff',
  ADMINS: 'admins',
  SETTINGS: 'settings',
  CONTROL: 'control',
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS)

export const PERMISSION_LABELS = {
  [PERMISSIONS.ENQUIRIES]: 'Manage enquiries',
  [PERMISSIONS.PRODUCTS]: 'Edit products & shop prices',
  [PERMISSIONS.SERVICES]: 'Edit services & pricing guide',
  [PERMISSIONS.STAFF]: 'Create & manage staff',
  [PERMISSIONS.ADMINS]: 'Create & manage admins',
  [PERMISSIONS.SETTINGS]: 'Platform settings',
  [PERMISSIONS.CONTROL]: 'Control Center (god mode)',
}

/** Default permissions for new admin accounts (everything except admins & settings). */
export const DEFAULT_ADMIN_PERMISSIONS = [
  PERMISSIONS.ENQUIRIES,
  PERMISSIONS.PRODUCTS,
  PERMISSIONS.SERVICES,
  PERMISSIONS.STAFF,
]

export function normalizePermissions(list) {
  if (!Array.isArray(list)) return []
  return list.filter((p) => ALL_PERMISSIONS.includes(p))
}

export function getUserPermissions(user) {
  if (!user) return []
  if (user.role === 'superadmin') return ALL_PERMISSIONS
  if (user.role === 'admin') return normalizePermissions(user.permissions)
  return []
}

export function hasPermission(user, permission) {
  return getUserPermissions(user).includes(permission)
}

export function canManageAdmins(user) {
  return user?.role === 'superadmin'
}
