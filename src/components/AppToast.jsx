import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './AppToast.css'

export default function AppToast() {
  const { toast } = useApp()
  if (!toast) return null

  return (
    <div className="app-toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.actionHref && toast.actionLabel && (
        <Link to={toast.actionHref} className="app-toast__action">
          {toast.actionLabel}
        </Link>
      )}
    </div>
  )
}
