import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Challans from './pages/Challans';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Employees from './pages/Employees';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute = ({ roles, children }: { roles: string[], children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<RoleRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}><Customers /></RoleRoute>} />
        <Route path="products" element={<RoleRoute roles={['ADMIN', 'SALES', 'WAREHOUSE']}><Products /></RoleRoute>} />
        <Route path="challans" element={<RoleRoute roles={['ADMIN', 'SALES']}><Challans /></RoleRoute>} />
        <Route path="invoices" element={<RoleRoute roles={['ADMIN', 'SALES', 'ACCOUNTS']}><Invoices /></RoleRoute>} />
        <Route path="payments" element={<RoleRoute roles={['ADMIN', 'ACCOUNTS']}><Payments /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute roles={['ADMIN']}><Settings /></RoleRoute>} />
        <Route path="employees" element={<RoleRoute roles={['ADMIN']}><Employees /></RoleRoute>} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
