import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import ManagerDashboardLayout from './layouts/ManagerDashboardLayout';
import DashboardHome from './pages/DashboardHome';
import LiveTransactions from './pages/LiveTransactions';
import Machines from './pages/Machines';
import TokenStorage from './pages/TokenStorage';
import CashierConsole from './pages/CashierConsole';
import Refunds from './pages/Refunds';
import Logs from './pages/Logs';
import ExportReports from './pages/ExportReports';
import SystemStatus from './pages/SystemStatus';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import ManagerTokenStorage from './pages/ManagerTokenStorage';
import ManagerRefund from './pages/ManagerRefund';
import ManagerMachines from './pages/ManagerMachines';
import ManagerLogs from './pages/ManagerLogs';
import ManagerSystemStatus from './pages/ManagerSystemStatus';
import ManagerDashboardHome from './pages/ManagerDashboardHome';
import About from './pages/About';
import Support from './pages/Support';

// Generic Protected Route (Authentication only)
const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/" replace />; // Redirect to Landing Page if not logged in
  }
  return children;
};

// Role-based Route (Authorization)
const OperatorRoute = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'operator' && user.role !== 'admin') { 
    return <Navigate to="/manager" replace />;
  }
  return children;
};

const ManagerRoute = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return <Navigate to="/operator" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Operator Routes */}
        <Route path="/operator" element={
          <OperatorRoute>
            <DashboardLayout />
          </OperatorRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="cashier" element={<CashierConsole />} />
          <Route path="transactions" element={<LiveTransactions />} />
          <Route path="machines" element={<Machines />} />
          <Route path="storage" element={<TokenStorage />} />
          <Route path="refunds" element={<Refunds />} />
          <Route path="logs" element={<Logs />} />
          <Route path="reports" element={<ExportReports />} />
          <Route path="status" element={<SystemStatus />} />
          <Route path="about" element={<About />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={
          <ManagerRoute>
            <ManagerDashboardLayout />
          </ManagerRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboardHome />} />
          <Route path="storage" element={<ManagerTokenStorage />} />
          <Route path="refunds" element={<ManagerRefund />} />
          <Route path="machines" element={<ManagerMachines />} />
          <Route path="logs" element={<ManagerLogs />} />
          <Route path="status" element={<ManagerSystemStatus />} />
          <Route path="about" element={<About />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
