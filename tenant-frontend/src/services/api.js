// src/services/api.js

import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Ensure this is correct
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // We let the components handle the errors to avoid double toasts
    // Especially since many components have local error states/alerts
    if (error.response && error.response.status === 401) {
      // Standard 401 handling could stay here if we want global logout
      // localStorage.clear(); 
    }
    return Promise.reject(error);
  }
);

export default instance;
