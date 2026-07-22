import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SimulationProvider } from './contexts/SimulationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RiskIntelligence from './pages/RiskIntelligence';
import PermitRiskCenter from './pages/PermitRiskCenter';
import Compliance from './pages/Compliance';
import LiveMonitoring from './pages/LiveMonitoring';
import FactoryMap from './pages/FactoryMap';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import AICopilot from './pages/AICopilot';
import Settings from './pages/Settings';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/risk-intelligence" element={<RiskIntelligence />} />
        <Route path="/permit-risk" element={<PermitRiskCenter />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/monitoring" element={<LiveMonitoring />} />
        <Route path="/factory-map" element={<FactoryMap />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/copilot" element={<AICopilot />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  const filePreview = typeof window !== 'undefined' && window.location.protocol === 'file:';
  const router = filePreview ? (
    <MemoryRouter initialEntries={['/login']}>
      <AppRoutes />
    </MemoryRouter>
  ) : (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );

  return (
    <AuthProvider>
      <SimulationProvider>{router}</SimulationProvider>
    </AuthProvider>
  );
}
