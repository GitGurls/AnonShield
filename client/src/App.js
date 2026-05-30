import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import LandingPage    from './pages/LandingPage';
import DashboardPage  from './pages/DashboardPage';
import VaultPage      from './pages/VaultPage';
import ThreatsPage    from './pages/ThreatsPage';
import IdentityPage   from './pages/IdentityPage';
import AuditPage      from './pages/AuditPage';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/vault"     element={<PrivateRoute><VaultPage /></PrivateRoute>} />
          <Route path="/threats"   element={<PrivateRoute><ThreatsPage /></PrivateRoute>} />
          <Route path="/identity"  element={<PrivateRoute><IdentityPage /></PrivateRoute>} />
          <Route path="/audit"     element={<PrivateRoute><AuditPage /></PrivateRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
