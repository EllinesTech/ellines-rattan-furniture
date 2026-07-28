export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  STAFF: 'staff',
  CLIENT: 'client',
}

export function normalizeRole(role) {
  const r = (role || '').toLowerCase()
  if (Object.values(ROLES).includes(r)) return r
  return null
}

export function isSuperAdmin(user) {
  return normalizeRole(user?.role) === ROLES.SUPERADMIN
}

export function isAdminRole(user) {
  const r = normalizeRole(user?.role)
  return r === ROLES.SUPERADMIN || r === ROLES.ADMIN
}

export function isStaffRole(user) {
  return normalizeRole(user?.role) === ROLES.STAFF
}

export function isClientRole(user) {
  return normalizeRole(user?.role) === ROLES.CLIENT
}

export function canAccessAdmin(user) {
  return isAdminRole(user)
}

export function canAccessStaff(user) {
  return isStaffRole(user) || isSuperAdmin(user)
}

export function canAccessClientDashboard(user) {
  return Boolean(user?.id)
}

export function getPostLoginRoute(user) {
  const role = normalizeRole(user?.role)
  switch (role) {
    case ROLES.SUPERADMIN:
    case ROLES.ADMIN:
      return '/admin'
    case ROLES.STAFF:
      return '/staff'
    case ROLES.CLIENT:
      return '/account'
    default:
      return '/'
  }
}

export function getRoleLabel(role) {
  const labels = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    staff: 'Staff',
    client: 'Client',
  }
  return labels[normalizeRole(role)] || 'User'
}
