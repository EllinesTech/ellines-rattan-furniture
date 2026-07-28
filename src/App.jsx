import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppToast from './components/AppToast'
import Layout from './layouts/Layout'
import AdminRoute from './components/AdminRoute'
import StaffRoute from './components/StaffRoute'
import AccountRoute from './components/AccountRoute'
import HomePage from './pages/HomePage'
import './App.css'

const CraftsmanshipPage = lazy(() => import('./pages/CraftsmanshipPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const FounderPage = lazy(() => import('./pages/FounderPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'))
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'))
const HospitalityPage = lazy(() => import('./pages/HospitalityPage'))
const GuidePage = lazy(() => import('./pages/GuidePage'))
const VisitPage = lazy(() => import('./pages/VisitPage'))
const CataloguePage = lazy(() => import('./pages/CataloguePage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const CookiesPage = lazy(() => import('./pages/CookiesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const QuotePage = lazy(() => import('./pages/QuotePage'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AccountLogin = lazy(() => import('./pages/AccountLogin'))
const Admin = lazy(() => import('./pages/Admin'))
const StaffDashboard = lazy(() => import('./pages/dashboard/StaffDashboard'))
const ClientDashboard = lazy(() => import('./pages/dashboard/ClientDashboard'))

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
    <AppProvider>
      <BrowserRouter>
        <AppToast />
        <Routes>
          <Route path="/admin/login" element={<LazyPage Page={AdminLogin} />} />
          <Route path="/account/login" element={<LazyPage Page={AccountLogin} />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <LazyPage Page={Admin} />
              </AdminRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <StaffRoute>
                <LazyPage Page={StaffDashboard} />
              </StaffRoute>
            }
          />
          <Route
            path="/account"
            element={
              <AccountRoute>
                <LazyPage Page={ClientDashboard} />
              </AccountRoute>
            }
          />

          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<LazyPage Page={ShopPage} />} />
            <Route path="quote" element={<LazyPage Page={QuotePage} />} />
            <Route path="craftsmanship" element={<LazyPage Page={CraftsmanshipPage} />} />
            <Route path="projects" element={<LazyPage Page={ProjectsPage} />} />
            <Route path="collections" element={<LazyPage Page={CollectionsPage} />} />
            <Route path="services" element={<LazyPage Page={ServicesPage} />} />
            <Route path="hospitality" element={<LazyPage Page={HospitalityPage} />} />
            <Route path="guide" element={<LazyPage Page={GuidePage} />} />
            <Route path="visit" element={<LazyPage Page={VisitPage} />} />
            <Route path="catalogue" element={<LazyPage Page={CataloguePage} />} />
            <Route path="contact" element={<LazyPage Page={ContactPage} />} />
            <Route path="about" element={<LazyPage Page={AboutPage} />} />
            <Route path="about/founder" element={<LazyPage Page={FounderPage} />} />
            <Route path="about/team" element={<LazyPage Page={TeamPage} />} />
            <Route path="materials" element={<LazyPage Page={MaterialsPage} />} />
            <Route path="faq" element={<LazyPage Page={FaqPage} />} />
            <Route path="delivery" element={<LazyPage Page={DeliveryPage} />} />
            <Route path="privacy" element={<LazyPage Page={PrivacyPage} />} />
            <Route path="terms" element={<LazyPage Page={TermsPage} />} />
            <Route path="cookies" element={<LazyPage Page={CookiesPage} />} />
            <Route path="*" element={<LazyPage Page={NotFoundPage} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
