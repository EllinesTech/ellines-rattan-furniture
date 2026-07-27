import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <p className="section-eyebrow">404</p>
        <h1>Page not found</h1>
        <p>
          This page does not exist or may have moved. Explore our collections or return home.
        </p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link to="/collections" className="btn btn-outline">
            Browse Collections
          </Link>
          <Link to="/contact" className="btn btn-outline">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}
