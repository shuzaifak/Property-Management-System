// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('adminUser');
      
      if (token && storedUser) {
        setAdminUser(JSON.parse(storedUser));
        
        try {
          // Fetch the freshest user data
          const res = await api.get('/users/me');
          const latestUser = res.data;
          setAdminUser(latestUser);
          localStorage.setItem('adminUser', JSON.stringify(latestUser));
        } catch (err) {
          console.error('Failed to refresh user data', err);
        }
      }
    };
    initAuth();
  }, []);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
    setAdminUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
  };

  const updateUser = (updatedUser) => {
    setAdminUser(updatedUser);
    localStorage.setItem('adminUser', JSON.stringify(updatedUser));
  }

  const isAuthenticated = !!adminUser && adminUser.role === 'admin';

  return (
    <AuthContext.Provider value={{ adminUser, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
