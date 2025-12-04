import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth and redirect if we're not already on a login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to appropriate login based on current location
        if (currentPath.includes('/admin')) {
          window.location.href = '/admin/login';
        } else if (currentPath.includes('/factura')) {
          window.location.href = '/factura/dashboard';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;