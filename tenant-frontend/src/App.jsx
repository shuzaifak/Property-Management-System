import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import Dashboard from './views/Dashboard';
import NotFound from './views/NotFound';
import ProtectedRoute from './components/Common/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51QTiuuKte9q4RbdlLaJij6SxoZQa1HSjbzCxik5OyrrhhYdh7X1paQjxKKr6DwyYso4gOMM7l4QIO3KoAiXuSW5K00LwgXEsFC'); 

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Router>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to dashboard if authenticated, else to login */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer theme="dark" position="top-right" autoClose={3000} hideProgressBar={false} /> {/* Toast Notifications */}
          </ErrorBoundary>
        </Router>
      </Elements>
    </AuthProvider>
  );
}

export default App;

