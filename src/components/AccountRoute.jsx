import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getPostLoginRoute } from '../utils/roles'

export default function AccountRoute({ children }) {
  const { user } = useApp()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/account/login" replace state={{ from: location }} />
  }

  if (user.role === 'client') {
    return children
  }

  const dashboard = getPostLoginRoute(user)
  if (dashboard !== '/account') {
    return <Navigate to={dashboard} replace />
  }

  return children
}
