import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceView from './pages/InvoiceView';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirects */}
          <Route path="/" element={<Navigate to="/facturare/dashboard" />} />
          
          {/* Facturare routes */}
          <Route path="/facturare">
            <Route index element={<Navigate to="/facturare/dashboard" />} />
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
            <Route path="invoices/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Route>
          
          {/* Legacy routes redirect to /facturare */}
          <Route path="/login" element={<Navigate to="/facturare/login" replace />} />
          <Route path="/register" element={<Navigate to="/facturare/register" replace />} />
          <Route path="/dashboard" element={<Navigate to="/facturare/dashboard" replace />} />
          <Route path="/companies" element={<Navigate to="/facturare/companies" replace />} />
          <Route path="/clients" element={<Navigate to="/facturare/clients" replace />} />
          <Route path="/products" element={<Navigate to="/facturare/products" replace />} />
          <Route path="/invoices/*" element={<Navigate to={`/facturare/invoices${window.location.pathname.replace('/invoices', '')}`} replace />} />
          <Route path="/reports" element={<Navigate to="/facturare/reports" replace />} />
          <Route path="/settings" element={<Navigate to="/facturare/settings" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;