import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import HomePage from './pages/HomePage'
import './App.css'

const CraftsmanshipPage = lazy(() => import('./pages/CraftsmanshipPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'))

function PageLoader() {
  return (
    <div className="page-loader" aria-live="polite">
      <span className="page-loader__spinner" />
    </div>
  )
}

function LazyPage({ Page }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="craftsmanship" element={<LazyPage Page={CraftsmanshipPage} />} />
          <Route path="projects" element={<LazyPage Page={ProjectsPage} />} />
          <Route path="services" element={<LazyPage Page={ServicesPage} />} />
          <Route path="contact" element={<LazyPage Page={ContactPage} />} />
          <Route path="about" element={<LazyPage Page={AboutPage} />} />
          <Route path="materials" element={<LazyPage Page={MaterialsPage} />} />
          <Route path="faq" element={<LazyPage Page={FaqPage} />} />
          <Route path="delivery" element={<LazyPage Page={DeliveryPage} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
