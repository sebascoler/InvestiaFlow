import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import Layout from './components/layout/Layout'
import CRMPage from './pages/CRMPage'
import DataRoomPage from './pages/DataRoomPage'
import AutomationPage from './pages/AutomationPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<CRMPage />} />
            <Route path="crm" element={<CRMPage />} />
            <Route path="dataroom" element={<DataRoomPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
