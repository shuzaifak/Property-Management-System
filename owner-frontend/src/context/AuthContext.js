// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [ownerUser, setOwnerUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('ownerUser');
    if (token && user) {
      setOwnerUser(JSON.parse(user));
    }
  }, []);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('ownerUser', JSON.stringify(user));
    setOwnerUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ownerUser');
    setOwnerUser(null);
  };

  const updateUser = (updatedUser) => {
    setOwnerUser(updatedUser);
    localStorage.setItem('ownerUser', JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!ownerUser && ownerUser.role === 'owner';

  return (
    <AuthContext.Provider value={{ ownerUser, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
