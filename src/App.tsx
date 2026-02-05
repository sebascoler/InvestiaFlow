import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { TeamProvider } from './contexts/TeamContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import CRMPage from './pages/CRMPage'
import DataRoomPage from './pages/DataRoomPage'
import AutomationPage from './pages/AutomationPage'
import TeamPage from './pages/TeamPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import LoginPage from './pages/LoginPage'
import InvestorLoginPage from './pages/InvestorLoginPage'
import InvestorDataRoomPage from './pages/InvestorDataRoomPage'
import InviteAcceptPage from './pages/InviteAcceptPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TeamProvider>
          <ThemeProvider>
            <BrowserRouter>
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
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </ThemeProvider>
        </TeamProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
