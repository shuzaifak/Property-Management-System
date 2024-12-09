import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OwnerLoginPage from './pages/OwnerLoginPage';
import OwnerRegisterPage from './pages/OwnerRegisterPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import AddPropertyPage from './pages/AddPropertyPage';
import ProfilePage from './pages/ProfilePage';
import { AuthContext } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<OwnerLoginPage />} />
      <Route path="/register" element={<OwnerRegisterPage />} />
      <Route path="/" element={isAuthenticated ? <OwnerDashboardPage /> : <Navigate to="/login" />} />
      <Route path="/properties" element={isAuthenticated ? <PropertiesPage /> : <Navigate to="/login" />} />
      <Route path="/add-property" element={isAuthenticated ? <AddPropertyPage /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
      {/* Add a catch-all route to redirect unknown paths to login or dashboard based on auth */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
    </Routes>
  );
}

export default App;