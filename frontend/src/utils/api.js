import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

const token = localStorage.getItem('nyaya_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// If the session token is missing/expired/invalid, every request will come back
// 401. Without this, the app just shows a generic "failed to load" toast on every
// page forever, with no way back to the login screen. This catches that globally,
// clears the stale token, and sends the person back to log in again.
let sessionExpiredHandled = false;
api.interceptors.response.use(
  (response) => {
    sessionExpiredHandled = false;
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      localStorage.removeItem('nyaya_token');
      delete api.defaults.headers.common['Authorization'];
      if (window.location.pathname !== '/login') {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
