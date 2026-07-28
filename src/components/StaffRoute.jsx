import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function StaffRoute({ children }) {
  const { user, canAccessStaff } = useApp()
  const location = useLocation()

  if (!user || !canAccessStaff) {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return <Navigate to="/admin" replace />
    }
    if (user?.role === 'client') {
      return <Navigate to="/account" replace />
    }
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}
