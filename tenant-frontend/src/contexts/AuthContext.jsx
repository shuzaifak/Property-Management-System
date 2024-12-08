// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from '../services/api'; // Correctly import the Axios instance
import { toast } from 'react-toastify';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        console.log('Token found:', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/users/me'); // Correct relative path
          console.log('Fetched user data:', res.data);
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data)); // Update stored user
        } catch (error) {
          console.error('Error fetching user:', error.response ? error.response.data : error.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          toast.error('Authentication failed. Please log in again.');
        }
      } else {
        console.log('No token found');
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/users/login', { email, password }); // Correct relative path
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('Logged in successfully!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/users/register', { name, email, password }); // Correct relative path
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('Registered successfully!');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.info('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
