import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
      // Simpan pesan di sessionStorage agar LoginPage bisa tampilkan notifikasi
      sessionStorage.setItem('nexabi_auth_msg', 'Sesi kamu telah berakhir. Silakan login kembali.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
