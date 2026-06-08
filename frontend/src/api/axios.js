import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api-nexabi.romitech.me/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interseptor: sisipkan token JWT otomatis di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexabi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interseptor: tangani error 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexabi_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
