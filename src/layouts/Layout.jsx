import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollProgress from '../components/ScrollProgress'
import WhatsAppFloat from '../components/WhatsAppFloat'
import CookieConsent from '../components/CookieConsent'
import { PAGE_META } from '../data/pages'

export default function Layout() {
  const { pathname } = useLocation()
  const { sitePages } = useApp()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const metaKey = (() => {
      if (pathname === '/') return 'home'
      if (pathname === '/about/founder') return 'aboutFounder'
      if (pathname === '/about/team') return 'aboutTeam'
      return pathname.slice(1).split('/')[0]
    })()
    const meta = (sitePages && sitePages[metaKey]) || PAGE_META[metaKey] || PAGE_META.home
    document.title = meta.title
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', meta.description)
  }, [pathname, sitePages])

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CookieConsent />
    </>
  )
}
