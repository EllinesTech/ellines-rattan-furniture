import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AdminRoute({ children }) {
  const { user, isAdmin } = useApp()
  const location = useLocation()

  if (!user || !isAdmin) {
    if (user?.role === 'staff') {
      return <Navigate to="/staff" replace />
    }
    if (user?.role === 'client') {
      return <Navigate to="/account" replace />
    }
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}
