import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'
import { StagesProvider } from './contexts/StagesContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import Layout from './components/layout/Layout'
import { Loader } from './components/shared/Loader'
import LoginPage from './pages/LoginPage'
import InvestorLoginPage from './pages/InvestorLoginPage'

// Lazy-loaded pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CRMPage = lazy(() => import('./pages/CRMPage'))
const DataRoomPage = lazy(() => import('./pages/DataRoomPage'))
const AutomationPage = lazy(() => import('./pages/AutomationPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const InvestorDataRoomPage = lazy(() => import('./pages/InvestorDataRoomPage'))
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage'))
const InvestorRelationsPage = lazy(() => import('./pages/InvestorRelationsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader size="lg" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TeamProvider>
          <StagesProvider>
          <ThemeProvider>
            <OnboardingProvider>
              <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Investor public routes */}
            <Route path="/investor/login" element={<InvestorLoginPage />} />
            <Route path="/investor/dataroom" element={<InvestorDataRoomPage />} />
            {/* Invitation acceptance route */}
            <Route path="/invite/:token" element={<InviteAcceptPage />} />
              {/* Protected routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
              <Route path="crm" element={<CRMPage />} />
              <Route path="dataroom" element={<DataRoomPage />} />
              <Route path="automation" element={<AutomationPage />} />
              <Route path="investor-relations" element={<InvestorRelationsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
            </OnboardingProvider>
          </ThemeProvider>
          </StagesProvider>
        </TeamProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
