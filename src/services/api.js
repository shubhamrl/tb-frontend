import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tb-backend-1.onrender.com/api', // Production backend ka URL
});

// Har request pe JWT token attach hoga
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
