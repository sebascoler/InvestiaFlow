import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import CRMPage from './pages/CRMPage'
import DataRoomPage from './pages/DataRoomPage'
import AutomationPage from './pages/AutomationPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="crm" element={<CRMPage />} />
              <Route path="dataroom" element={<DataRoomPage />} />
              <Route path="automation" element={<AutomationPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
