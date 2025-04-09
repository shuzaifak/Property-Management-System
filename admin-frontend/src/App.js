import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PropertiesPage from './pages/PropertiesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ResetPassword from './pages/ResetPassword';
import { AuthContext } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/users" element={isAuthenticated ? <UsersPage /> : <Navigate to="/login" />} />
      <Route path="/properties" element={isAuthenticated ? <PropertiesPage /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
